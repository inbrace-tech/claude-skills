#!/usr/bin/env node
// The maintainer's release steps around Changesets. Run from the repository root:
//   node scripts/release.ts version   `changeset version`, then copy each version into plugin.json (`pnpm run release:version`)
//   node scripts/release.ts tag       make sure origin has a signed `<plugin>@<version>` tag per plugin (`pnpm run release`)
// Each step first fetches origin and refuses, listing every reason, unless HEAD is origin/main and the
// tree is clean; `version` also needs a pending changeset, `tag` needs none and a passing check-version.
// `version` hands the changelog generator a GitHub token — GITHUB_TOKEN when set, else `gh auth token` —
// through the child's environment only: never printed, never an argument, never on disk.
// `tag` derives the expected tag from each plugin's package.json, so a tag whose push or check failed
// in an earlier run is verified and pushed again; a tag already on origin is fetched and must be signed.
// Exit codes: 0 done, 1 a step failed, 2 wrong usage.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isChangesetFile } from "./check-changeset-size.logic.ts";
import { lsRemoteTags, planTags, releasePreconditions, releaseTag, signedTagEnv } from "./release.logic.ts";
import type { Stage } from "./release.logic.ts";

const syncScript = join(import.meta.dirname, "sync-plugin-version.ts");
const verifyTagScript = join(import.meta.dirname, "verify-tag-signature.ts");
const changesetBin = join(import.meta.dirname, "..", "node_modules", "@changesets", "cli", "bin.js");

function fail(message: string): never {
  console.error(`release: ${message}`);
  process.exit(1);
}

/** Runs a command with inherited output; exits when it fails, with `hint` when given. */
function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env, hint?: string): void {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error !== undefined) fail(`${command} did not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${[command, ...args].join(" ")} exited ${String(result.status ?? result.signal)}${hint === undefined ? "" : `\n${hint}`}`);
}

const git = (args: string[]): string => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const localTags = (): Set<string> => new Set(git(["tag", "--list"]).split("\n").filter((tag) => tag !== ""));

/** Fetches origin's main (an unreachable remote fails here) and refuses `stage` on any failed precondition. */
function checkPreconditions(stage: Stage): void {
  run("git", ["fetch", "origin", "main", "--tags"]);
  const errors = releasePreconditions(stage, {
    porcelain: git(["status", "--porcelain"]),
    head: git(["rev-parse", "HEAD"]).trim(),
    originMain: git(["rev-parse", "origin/main"]).trim(),
    pendingChangesets: existsSync(".changeset") ? readdirSync(".changeset").filter(isChangesetFile) : [],
  });
  if (errors.length > 0) fail(`not running \`${stage}\`:\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

/** `<name>@<version>` for each plugin's package.json, the tags a release must have on origin. */
function expectedTags(): string[] {
  const expected: string[] = [];
  for (const entry of readdirSync("plugins", { withFileTypes: true })) {
    const path = join("plugins", entry.name, "package.json");
    if (!entry.isDirectory() || !existsSync(path)) continue;
    const { name, version } = JSON.parse(readFileSync(path, "utf8")) as { name?: unknown; version?: unknown };
    if (typeof name !== "string" || typeof version !== "string") fail(`${path} needs a "name" and a "version"`);
    expected.push(releaseTag(name, version));
  }
  return expected;
}

/** GITHUB_TOKEN when exported, else the gh CLI's token; its output is captured, never echoed. */
function githubToken(): string {
  const exported = process.env["GITHUB_TOKEN"];
  if (exported !== undefined && exported !== "") return exported;
  try {
    const token = execFileSync("gh", ["auth", "token"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (token !== "") return token;
  } catch {
    // Reported below without gh's output.
  }
  fail("the changelog needs a GitHub token: export GITHUB_TOKEN, or sign in with `gh auth login`");
}

function version(): void {
  checkPreconditions("version");
  run(process.execPath, [changesetBin, "version"], { ...process.env, GITHUB_TOKEN: githubToken() });
  run(process.execPath, [syncScript]);
  console.log("release: versions moved; review the diff, then branch, commit and open the version pull request");
}

function tag(): void {
  checkPreconditions("tag");
  run(process.execPath, [syncScript, "--check"]);
  // Creates each expected tag that is neither here nor on origin; it skips one that exists locally.
  run(process.execPath, [changesetBin, "git-tag"], signedTagEnv(process.env));

  const plan = planTags(expectedTags(), lsRemoteTags(git(["ls-remote", "--tags", "origin"])), localTags());
  if (plan.missing.length > 0) fail(`\`changeset git-tag\` did not create ${plan.missing.join(", ")}; see its output above`);

  for (const name of plan.published) {
    run("git", ["fetch", "--no-tags", "origin", `+refs/tags/${name}:refs/tags/${name}`]);
    run(process.execPath, [verifyTagScript, name], process.env, `${name} is on origin but not a signed tag: delete it (\`git push origin :refs/tags/${name}\` and \`git tag --delete ${name}\`), then run \`pnpm run release\` again`);
  }
  if (plan.push.length === 0) {
    console.log(`release: every expected tag is on origin and signed (${plan.published.join(", ")}); nothing to do`);
    return;
  }
  for (const name of plan.push) run(process.execPath, [verifyTagScript, name, "--verify-signature"]);
  run("git", ["push", "origin", ...plan.push.map((name) => `refs/tags/${name}`)]);
  console.log(`release: pushed ${plan.push.join(", ")}; publish a GitHub Release for each with \`pnpm run release:notes\` (CONTRIBUTING.md › Versions)`);
}

const [command, ...extra] = process.argv.slice(2);
if (extra.length > 0 || (command !== "version" && command !== "tag")) {
  console.error(`release: ${extra.length > 0 ? `unexpected argument(s): ${extra.join(" ")}` : `unknown command ${JSON.stringify(command ?? "")}`}\nusage: node scripts/release.ts <version|tag>`);
  process.exit(2);
}
if (command === "version") version();
else tag();
