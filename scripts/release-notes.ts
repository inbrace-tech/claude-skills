#!/usr/bin/env node
// Prints one version's GitHub Release notes: its section of the plugin's CHANGELOG.md and a link to
// the full changelog at the tag. The rules live in release-notes.logic.ts. Run from the repository root:
//   node scripts/release-notes.ts <version> [--plugin <name>]   (`pnpm --silent run release:notes <version>`)
// <version> is 1.2.3, v1.2.3 or <plugin>@1.2.3. It is required, never read from package.json, so a
// run before the version pull request merges fails instead of printing the previous release.
// `--plugin` may be left out while there is one plugin, or when the version names it.
// Write the output to a file for `gh release create --notes-file`; a pipe would hide a failure here.
// Exit codes: 0 printed, 1 no such section or an empty one, 2 wrong usage, a malformed version or not run from the repository root.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseVersionArg, releaseNotes } from "./release-notes.logic.ts";

function usage(message: string): never {
  console.error(`release-notes: ${message}\nusage: node scripts/release-notes.ts <version> [--plugin <name>]`);
  process.exit(2);
}

const plugins = join(process.cwd(), "plugins");
if (!existsSync(plugins)) usage("no plugins/ directory here; run it from the repository root");

const args = process.argv.slice(2);
const flag = args.indexOf("--plugin");
const pluginFlag = flag === -1 ? undefined : args[flag + 1];
if (flag !== -1 && (pluginFlag === undefined || pluginFlag.startsWith("-"))) usage("--plugin needs a name");
const positional = args.filter((_arg, index) => flag === -1 || (index !== flag && index !== flag + 1));
const [arg] = positional;
if (arg === undefined || positional.length > 1 || arg.startsWith("-")) usage("pass exactly one version");

const names = readdirSync(plugins, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const parsed = parseVersionArg(arg, names, pluginFlag);
if ("error" in parsed) usage(parsed.error);
const { plugin, version } = parsed;

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
