#!/usr/bin/env node
// Checks every pending changeset in .changeset/: frontmatter naming known plugin packages with a
// patch, minor or major bump, and a one-line summary under the ceiling. The rules live in
// check-changeset-size.logic.ts. Run from the repository root: `pnpm run release:check-changesets`.
// Exit codes: 0 every changeset passes (or there is none), 1 a changeset fails, 2 not run from the repository root.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { checkChangeset, isChangesetFile } from "./check-changeset-size.logic.ts";

const root = process.cwd();
const changesets = join(root, ".changeset");
const plugins = join(root, "plugins");

if (!existsSync(changesets) || !existsSync(plugins)) {
  console.error("check-changeset-size: no .changeset/ or plugins/ directory here; run it from the repository root");
  process.exit(2);
}

/** The name in each plugins/<plugin>/package.json; check-version reports a plugin without one. */
const packages = new Set<string>();
for (const entry of readdirSync(plugins, { withFileTypes: true })) {
  const path = join(plugins, entry.name, "package.json");
  if (!entry.isDirectory() || !existsSync(path)) continue;
  const { name } = JSON.parse(readFileSync(path, "utf8")) as { name?: unknown };
  if (typeof name === "string") packages.add(name);
}

const files = readdirSync(changesets, { withFileTypes: true }).filter((entry) => entry.isFile() && isChangesetFile(entry.name));
const errors = files.flatMap((entry) => checkChangeset(`.changeset/${entry.name}`, readFileSync(join(changesets, entry.name), "utf8"), packages));

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-changeset-size: ${errors.length} error(s) across ${files.length} changeset(s)`);
  process.exit(1);
}
console.log(`check-changeset-size: ${files.length} changeset(s), all one line within the ceiling`);
