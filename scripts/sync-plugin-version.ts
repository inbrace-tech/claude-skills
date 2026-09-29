#!/usr/bin/env node
// Copies each plugin's package.json version, which Changesets moves, into its
// .claude-plugin/plugin.json, where Claude Code reads it. The rules live in
// sync-plugin-version.logic.ts; this file reads and writes. Run from the repository root:
//   node scripts/sync-plugin-version.ts            write every plugin.json that differs
//   node scripts/sync-plugin-version.ts --check    write nothing, fail on any difference (`pnpm run check-version`)
// Both fail when a marketplace entry sets a version other than its plugin's.
// Exit codes: 0 in sync (or synced), 1 out of sync or unreadable, 2 not run from the repository root.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkMarketplace, syncPlugin } from "./sync-plugin-version.logic.ts";

const root = process.cwd();
const plugins = join(root, "plugins");
const check = process.argv.includes("--check");

if (!existsSync(plugins)) {
  console.error("sync-plugin-version: no plugins/ directory here; run it from the repository root");
  process.exit(2);
}

const readIfPresent = (path: string): string | null => (existsSync(path) ? readFileSync(path, "utf8") : null);
const errors: string[] = [];
const versions = new Map<string, string>();
let changed = 0;

for (const entry of readdirSync(plugins, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = `plugins/${entry.name}`;
  const pluginPath = join(root, dir, ".claude-plugin", "plugin.json");
  const pluginText = readIfPresent(pluginPath);
  const result = syncPlugin({ dir, packageText: readIfPresent(join(root, dir, "package.json")), pluginText });
  errors.push(...result.errors);
  if (result.version !== null) versions.set(dir, result.version);
  if (result.errors.length > 0 || result.pluginText === null || result.pluginText === pluginText) continue;

  changed += 1;
  if (check) {
    errors.push(`${dir}/.claude-plugin/plugin.json: version differs from ${dir}/package.json (${result.version}); run \`node scripts/sync-plugin-version.ts\``);
  } else {
    writeFileSync(pluginPath, result.pluginText);
    console.log(`${dir}/.claude-plugin/plugin.json: version set to ${result.version}`);
  }
}

const marketplace = readIfPresent(join(root, ".claude-plugin", "marketplace.json"));
if (marketplace === null) errors.push(".claude-plugin/marketplace.json: missing");
else errors.push(...checkMarketplace(marketplace, versions));

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`sync-plugin-version: ${errors.length} error(s)`);
  process.exit(1);
}
const summary = [...versions].map(([dir, version]) => `${dir} ${version}`).join(", ");
console.log(`sync-plugin-version: ${check || changed === 0 ? "in sync" : `${changed} plugin.json updated`}: ${summary}`);
