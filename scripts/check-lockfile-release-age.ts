#!/usr/bin/env node
// Audits `pnpm-lock.yaml` against the npm registry: is every resolved version
// still published, and past the `minimumReleaseAge` floor that
// `pnpm-workspace.yaml` sets?
//
//   node scripts/check-lockfile-release-age.ts [--base <ref> | --all] [--verbose]
//
// Which entries it asks about, and which of the two questions, depends on the
// mode:
//   --base <ref>  the pull-request audit, the default. Diffs the lockfile
//                 against its merge base with `<ref>` (default `origin/main`)
//                 and asks both questions of what the change ADDS.
//   --all         the scheduled sweep. Asks the takedown question of the WHOLE
//                 lockfile: the case a per-PR delta cannot see, since nothing
//                 about the lockfile changes when the registry removes a
//                 version.
// Why each mode asks what it asks is written up in
// check-lockfile-release-age.logic.ts, which holds the rules and says what was
// ported from Inbrace's internal agent harness and what differs. This file
// reads git and the two pnpm files, fetches from the registry, prints and sets
// the exit code: 0 clean, 1 a violation or an audit that could not run.
//
// NOT PART OF `pnpm test` OR ci.yml
//
// Every other check in this repository is offline and deterministic. This one
// talks to registry.npmjs.org, and chaining a network call into those checks
// would make a red result ambiguous between "a dependency is unsafe" and "the
// network blipped". It runs in the dependency-audit workflows instead, and
// locally as `pnpm run audit:lockfile` and `pnpm run audit:lockfile:all`.
//
// A REGISTRY IT CANNOT REACH FAILS THE AUDIT
//
// A check that reports green when it could not run is indistinguishable from a
// satisfied one. An unreachable registry, an unparseable packument, an
// unreadable lockfile or base ref, or a missing `minimumReleaseAge` key all
// exit 1 and say which.
//
// Node 24 runs it as is, stripping the types, with no build and no runtime
// dependency.

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

/** How many packuments to have in flight at once. */
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
 * The lockfile at the merge base of HEAD and `baseRef`, not at `baseRef`
 * itself: a base branch that moved on since this branch forked would otherwise
 * count what this branch never picked up as its own additions and removals.
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

  // Not a violation but an audit that cannot run: there is no floor to
  // enforce, and reporting a clean tree would misdescribe a configuration that
  // lost its supply-chain quarantine.
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

// The sweep asks the takedown question alone: every entry already on the
// branch passed the floor when it merged, so flagging one again would be noise.
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
