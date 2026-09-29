#!/usr/bin/env node
// Checks that a release tag is annotated and signed. The rules live in verify-tag-signature.logic.ts.
//   node scripts/verify-tag-signature.ts <tag>                      presence: CI, which holds no maintainer key
//   node scripts/verify-tag-signature.ts <tag> --verify-signature   also `git tag -v`: the maintainer, holding the key
// (`pnpm run release:verify-tag <tag> [--verify-signature]`). The tag must be in this clone as an
// annotated ref: fetch it with `git fetch origin +refs/tags/<tag>:refs/tags/<tag>`.
// Exit codes: 0 signed (and verified), 1 missing, lightweight, unsigned or unverified, 2 wrong usage.

import { execFileSync, spawnSync } from "node:child_process";
import { checkTagObject } from "./verify-tag-signature.logic.ts";

const args = process.argv.slice(2);
const verify = args.includes("--verify-signature");
const positional = args.filter((arg) => arg !== "--verify-signature");
const [name] = positional;
if (name === undefined || positional.length > 1 || name.startsWith("-")) {
  console.error("usage: node scripts/verify-tag-signature.ts <tag> [--verify-signature]");
  process.exit(2);
}

function fail(message: string): never {
  console.error(`verify-tag-signature: ${message}`);
  process.exit(1);
}

const git = (gitArgs: string[]): string | null => {
  try {
    return execFileSync("git", gitArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
};

const ref = `refs/tags/${name}`;
const type = git(["cat-file", "-t", ref])?.trim();
if (type === undefined) fail(`${name}: no such tag in this clone; fetch it with \`git fetch origin +${ref}:${ref}\``);

const errors = checkTagObject(name, type, type === "tag" ? git(["cat-file", "tag", ref]) : null);
if (errors.length > 0) fail(errors.join("\n"));

if (verify) {
  const result = spawnSync("git", ["tag", "-v", name], { stdio: "inherit" });
  if (result.status !== 0) fail(`${name}: \`git tag -v\` could not verify the signature`);
}
console.log(`verify-tag-signature: ${name} is annotated and signed${verify ? ", and the signature verifies" : " (presence only)"}`);
