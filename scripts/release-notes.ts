#!/usr/bin/env node
// Prints one version's GitHub Release notes: its section of the plugin's CHANGELOG.md and a link to
// the full changelog at the tag. The rules live in release-notes.logic.ts. Run from the repository root:
//   node scripts/release-notes.ts <version> [--plugin <name>]   (`pnpm --silent run release:notes <version>`)
// The version is required, never read from package.json, so a run before the version pull request
// merges fails instead of printing the previous release. `--plugin` may be left out while there is one plugin.
// Write the output to a file for `gh release create --notes-file`; a pipe would hide a failure here.
// Exit codes: 0 printed, 1 no such section or an empty one, 2 wrong usage or not run from the repository root.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { releaseNotes } from "./release-notes.logic.ts";

function usage(message: string): never {
  console.error(`release-notes: ${message}\nusage: node scripts/release-notes.ts <version> [--plugin <name>]`);
  process.exit(2);
}

const plugins = join(process.cwd(), "plugins");
if (!existsSync(plugins)) usage("no plugins/ directory here; run it from the repository root");

const args = process.argv.slice(2);
const flag = args.indexOf("--plugin");
const pluginArg = flag === -1 ? undefined : args[flag + 1];
if (flag !== -1 && pluginArg === undefined) usage("--plugin needs a name");
const positional = args.filter((_arg, index) => flag === -1 || (index !== flag && index !== flag + 1));
const [version] = positional;
if (version === undefined || positional.length > 1) usage("pass exactly one version");

const names = readdirSync(plugins, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const [only] = names;
const plugin = pluginArg ?? (names.length === 1 ? only : undefined);
if (plugin === undefined) usage(`several plugins here (${names.join(", ")}); pass --plugin`);

const changelogPath = join(plugins, plugin, "CHANGELOG.md");
if (!existsSync(changelogPath)) {
  console.error(`release-notes: plugins/${plugin}/CHANGELOG.md does not exist`);
  process.exit(1);
}
const result = releaseNotes(plugin, readFileSync(changelogPath, "utf8"), version);
if ("error" in result) {
  console.error(`release-notes: ${result.error}`);
  process.exit(1);
}
process.stdout.write(result.notes);
