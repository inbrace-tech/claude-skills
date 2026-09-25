#!/usr/bin/env node
// Audits pnpm-lock.yaml against the npm registry: every resolved version must still be published
// and, per pull request, older than `minimumReleaseAge`. It needs the network, so the
// dependency-audit workflows run it, never `pnpm test` or ci.yml.
//   node scripts/check-lockfile-release-age.ts [--base <ref> (default origin/main) | --all] [--verbose]
// Exit codes: 0 clean, 1 a violation or an audit that could not run; an unreachable registry never passes.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  addedResolvedVersions,
  allResolvedVersions,
  auditPackages,
  formatMinutes,
  formatViolations,
  parseMinimumReleaseAge,
  registryFactsFromPackument,
} from "./check-lockfile-release-age.logic.ts";
import type { RegistryFact, ResolvedPackage } from "./check-lockfile-release-age.logic.ts";

const LOCKFILE = "pnpm-lock.yaml";
const WORKSPACE_MANIFEST = "pnpm-workspace.yaml";
const REGISTRY = "https://registry.npmjs.org";

/** Packuments in flight at once. */
const CONCURRENCY = 8;

/** Per-request ceiling, so a hung socket fails the job instead of its timeout. */
const REQUEST_TIMEOUT_MS = 20_000;

function fail(message: string): never {
  console.error(`::error::${message}`);
  process.exit(1);
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

const verbose = process.argv.includes("--verbose");
const sweepAll = process.argv.includes("--all");
const baseRef = argValue("--base") ?? "origin/main";

if (sweepAll && process.argv.includes("--base")) {
  fail("`--all` and `--base` are different scopes; pass one or the other.");
}

let repoRoot: string;
try {
  repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
} catch {
  fail("Lockfile audit must run inside a git checkout of this repository.");
}

/**
 * The lockfile at the merge base with `baseRef`, not at `baseRef`: otherwise changes the base made
 * after this branch forked would count as this branch's.
 */
function readBaseLockfile(): string {
  try {
    const mergeBase = execFileSync("git", ["merge-base", "HEAD", baseRef], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return execFileSync("git", ["show", `${mergeBase}:${LOCKFILE}`], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    fail(
      `Lockfile audit could not read ${LOCKFILE} at the merge base with ${baseRef}. ` +
        "Fetch the base ref (`git fetch origin main`) and re-run, or pass " +
        "`--base <ref>` naming a ref this clone has.",
    );
  }
}

function readHeadLockfile(): string {
  try {
    return readFileSync(join(repoRoot, LOCKFILE), "utf8");
  } catch {
    fail(`Lockfile audit could not read ${LOCKFILE} in the working tree.`);
  }
}

function readMinimumReleaseAge(): number {
  let workspaceText: string;
  try {
    workspaceText = readFileSync(join(repoRoot, WORKSPACE_MANIFEST), "utf8");
  } catch {
    fail(`Lockfile audit could not read ${WORKSPACE_MANIFEST}.`);
  }

  // A missing floor fails the audit: passing would hide a lost supply-chain quarantine.
  const minutes = parseMinimumReleaseAge(workspaceText);
  if (minutes === undefined) {
    fail(
      `Lockfile audit found no \`minimumReleaseAge\` in ${WORKSPACE_MANIFEST}. ` +
        "That key is this repository's supply-chain quarantine and the floor this " +
        "audit enforces; restore it rather than removing the audit.",
    );
  }
  return minutes;
}

/** The packument facts for one package name, keyed by version. */
async function fetchRegistryFacts(name: string): Promise<Map<string, RegistryFact>> {
  const url = `${REGISTRY}/${name.replace("/", "%2F")}`;
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  const packument: unknown = await response.json();
  return registryFactsFromPackument(packument);
}

const headText = readHeadLockfile();
const declaredFloor = readMinimumReleaseAge();

// The sweep asks only the takedown question: every entry passed the floor when it merged.
const minimumReleaseAgeMinutes = sweepAll ? null : declaredFloor;

let packages: ResolvedPackage[];
let scopeLabel: string;

if (sweepAll) {
  packages = allResolvedVersions(headText);
  scopeLabel = `all ${packages.length} resolved version(s), takedown check only`;
} else {
  packages = addedResolvedVersions(readBaseLockfile(), headText);
  scopeLabel = `${packages.length} newly resolved version(s), floor ${formatMinutes(declaredFloor)}`;
  if (packages.length === 0) {
    console.log(`Lockfile audit OK: ${LOCKFILE} resolves nothing that its merge base with ${baseRef} did not.`);
    process.exit(0);
  }
}

console.log(`Checking ${scopeLabel} against the registry.`);

let result: Awaited<ReturnType<typeof auditPackages>>;
try {
  result = await auditPackages({
    packages,
    fetchFacts: fetchRegistryFacts,
    now: Date.now(),
    minimumReleaseAgeMinutes,
    concurrency: CONCURRENCY,
  });
} catch (error) {
  fail(`Lockfile audit failed unexpectedly: ${error instanceof Error ? error.message : String(error)}`);
}

if (verbose) {
  for (const { pkg, fact } of result.checked) {
    console.log(`  ${pkg.name}@${pkg.version} published=${fact.publishedAt ?? "unknown"} stillPublished=${String(fact.stillPublished)}`);
  }
}

if (result.unreachable.length > 0) {
  fail(
    `Lockfile audit could not reach the registry for ${result.unreachable.length} ` +
      `package(s): ${result.unreachable.join(", ")}. The audit does not pass what it could not ` +
      "check; re-run once the registry is reachable.",
  );
}

if (result.violations.length > 0) {
  console.error(`::error::${result.violations.length} lockfile violation(s):`);
  console.error(formatViolations(result.violations));
  console.error(
    "\nA `version-absent-from-registry` finding is a takedown until proven otherwise: " +
      "do not re-resolve around it, establish why the version disappeared. " +
      "A `version-too-fresh` finding clears itself by waiting out the floor.",
  );
  process.exit(1);
}

console.log(`Lockfile audit OK: ${scopeLabel}: nothing to report.`);
