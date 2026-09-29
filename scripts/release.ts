#!/usr/bin/env node
// The maintainer's release steps around Changesets. Run from the repository root:
//   node scripts/release.ts version   `changeset version`, then copy each version into plugin.json (`pnpm run release:version`)
//   node scripts/release.ts tag       sign a `<plugin>@<version>` tag per new version, verify it, push only the new ones (`pnpm run release`)
// The changelog generator asks GitHub who wrote each change: `version` takes GITHUB_TOKEN when set,
// else `gh auth token`, and hands it to the child's environment only — never printed, never an argument.
// Exit codes: 0 done, 1 a step failed, 2 wrong usage.

import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
import { newTags, signedTagEnv } from "./release.logic.ts";

const syncScript = join(import.meta.dirname, "sync-plugin-version.ts");
const verifyTagScript = join(import.meta.dirname, "verify-tag-signature.ts");

function fail(message: string): never {
  console.error(`release: ${message}`);
  process.exit(1);
}

/** Runs a command with inherited output; exits with its status when it fails. */
function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env): void {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error !== undefined) fail(`${command} did not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${[command, ...args].join(" ")} exited ${String(result.status ?? result.signal)}`);
}

const git = (args: string[]): string => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const tags = (): string[] => git(["tag", "--list"]).split("\n").filter((tag) => tag !== "");

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
  run("pnpm", ["exec", "changeset", "version"], { ...process.env, GITHUB_TOKEN: githubToken() });
  run(process.execPath, [syncScript]);
  console.log("release: versions moved; review the diff, then open the version PR");
}

function tag(): void {
  if (git(["status", "--porcelain"]).trim() !== "") fail("the working tree has changes; tag a clean checkout of the merged version PR");
  run(process.execPath, [syncScript, "--check"]);

  const before = tags();
  run("pnpm", ["exec", "changeset", "git-tag"], signedTagEnv(process.env));
  // `changeset git-tag` skips a version whose tag exists here or on origin, so only new ones appear.
  const push = newTags(before, tags());
  if (push.length === 0) {
    console.log("release: no new version to tag");
    return;
  }
  for (const name of push) run(process.execPath, [verifyTagScript, name, "--verify-signature"]);
  run("git", ["push", "origin", ...push.map((name) => `refs/tags/${name}`)]);
  console.log(`release: pushed ${push.join(", ")}; publish a GitHub Release for each with \`pnpm run release:notes\` (CONTRIBUTING.md › Versions)`);
}

const command = process.argv[2];
if (command === "version") version();
else if (command === "tag") tag();
else {
  console.error("usage: node scripts/release.ts <version|tag>");
  process.exit(2);
}
