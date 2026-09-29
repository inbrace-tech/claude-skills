#!/usr/bin/env node
// The last release step: make sure origin has a signed `<plugin>@<version>` tag for each plugin's
// package.json version. Run from the repository root on the merged main: `pnpm run release`.
// It first fetches origin and refuses, listing every reason, unless HEAD is origin/main, the tree is
// clean and no changeset is pending (release-preconditions.logic.ts); then check-version must pass.
// `changeset git-tag` creates, signed, each tag that is neither here nor on origin. Then, per expected
// tag: one on origin is fetched and must be annotated and signed; one only here — just created, or
// left by a run whose push failed — is verified with `git tag -v` and pushed. It reports nothing to do
// only when every expected tag is on origin.
// Exit codes: 0 done, 1 refused or a step failed, 2 wrong usage.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readReleaseState, refusal, releasePreconditions } from "./release-preconditions.logic.ts";
import { expectedTags, lsRemoteTags, planTags, signedTagEnv, unsignedRemedy } from "./release-tag.logic.ts";

const syncScript = join(import.meta.dirname, "sync-plugin-version.ts");
const verifyTagScript = join(import.meta.dirname, "verify-tag-signature.ts");
const changesetBin = join(import.meta.dirname, "..", "node_modules", "@changesets", "cli", "bin.js");

if (process.argv.length > 2) {
  console.error(`release-tag: unexpected argument(s): ${process.argv.slice(2).join(" ")}\nusage: node scripts/release-tag.ts`);
  process.exit(2);
}

function fail(message: string): never {
  console.error(`release-tag: ${message}`);
  process.exit(1);
}

/** Runs a command with inherited output; exits when it fails, with `hint` when given. */
function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env, hint?: string): void {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error !== undefined) fail(`${command} did not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${[command, ...args].join(" ")} exited ${String(result.status ?? result.signal)}${hint === undefined ? "" : `\n${hint}`}`);
}

const git = (args: string[]): string => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

// An unreachable origin fails here: tagging without knowing origin/main never passes.
run("git", ["fetch", "origin", "main", "--tags"]);
const refused = refusal("tag", releasePreconditions("tag", readReleaseState(git, existsSync(".changeset") ? readdirSync(".changeset") : [])));
if (refused !== null) fail(refused);
run(process.execPath, [syncScript, "--check"]);

const packages = readdirSync("plugins", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join("plugins", entry.name, "package.json")))
  .map((entry) => {
    const path = join("plugins", entry.name, "package.json");
    return { path, text: readFileSync(path, "utf8") };
  });
const expected = expectedTags(packages);
if (expected.errors.length > 0) fail(expected.errors.join("\n"));

// Creates each expected tag that is neither here nor on origin; it skips one that exists locally.
run(process.execPath, [changesetBin, "git-tag"], signedTagEnv(process.env));

const local = new Set(git(["tag", "--list"]).split("\n").filter((tag) => tag !== ""));
const plan = planTags(expected.tags, lsRemoteTags(git(["ls-remote", "--tags", "origin"])), local);
if (plan.missing.length > 0) fail(`\`changeset git-tag\` did not create ${plan.missing.join(", ")}; see its output above`);

for (const name of plan.published) {
  run("git", ["fetch", "--no-tags", "origin", `+refs/tags/${name}:refs/tags/${name}`]);
  run(process.execPath, [verifyTagScript, name], process.env, unsignedRemedy(name));
}
if (plan.push.length === 0) {
  console.log(`release-tag: every expected tag is on origin and signed (${plan.published.join(", ")}); nothing to do`);
} else {
  for (const name of plan.push) run(process.execPath, [verifyTagScript, name, "--verify-signature"]);
  run("git", ["push", "origin", ...plan.push.map((name) => `refs/tags/${name}`)]);
  console.log(`release-tag: pushed ${plan.push.join(", ")}; publish a GitHub Release for each with \`pnpm run release:notes\` (CONTRIBUTING.md › Versions)`);
}
