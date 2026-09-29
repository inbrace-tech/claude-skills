#!/usr/bin/env node
// The first release step: `changeset version`, then copy each plugin's new version into its
// plugin.json. Run from the repository root on an up-to-date main: `pnpm run release:version`.
// It first fetches origin and refuses, listing every reason, unless HEAD is origin/main, the tree is
// clean and a changeset is pending (release-preconditions.logic.ts). The changelog generator asks
// GitHub who wrote each change: the token is GITHUB_TOKEN when set, else `gh auth token`, and it goes
// to the child's environment only — never printed, never an argument, never on disk.
// Exit codes: 0 versions moved, 1 refused or a step failed, 2 wrong usage.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readReleaseState, refusal, releasePreconditions } from "./release-preconditions.logic.ts";
import { resolveToken } from "./release-version.logic.ts";

const syncScript = join(import.meta.dirname, "sync-plugin-version.ts");
const changesetBin = join(import.meta.dirname, "..", "node_modules", "@changesets", "cli", "bin.js");

if (process.argv.length > 2) {
  console.error(`release-version: unexpected argument(s): ${process.argv.slice(2).join(" ")}\nusage: node scripts/release-version.ts`);
  process.exit(2);
}

function fail(message: string): never {
  console.error(`release-version: ${message}`);
  process.exit(1);
}

/** Runs a command with inherited output; exits when it fails. */
function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env): void {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error !== undefined) fail(`${command} did not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${[command, ...args].join(" ")} exited ${String(result.status ?? result.signal)}`);
}

const git = (args: string[]): string => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

/** gh's token, captured and never echoed; null when gh is missing, signed out or fails. */
function ghToken(): string | null {
  try {
    return execFileSync("gh", ["auth", "token"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

// An unreachable origin fails here: a release never starts from a main it could not check.
run("git", ["fetch", "origin", "main"]);
const refused = refusal("version", releasePreconditions("version", readReleaseState(git, existsSync(".changeset") ? readdirSync(".changeset") : [])));
if (refused !== null) fail(refused);

const token = resolveToken(process.env, ghToken);
if ("error" in token) fail(token.error);
run(process.execPath, [changesetBin, "version"], { ...process.env, GITHUB_TOKEN: token.token });
run(process.execPath, [syncScript]);
console.log("release-version: versions moved; review the diff, then branch, commit and open the version pull request");
