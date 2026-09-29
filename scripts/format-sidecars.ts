#!/usr/bin/env node
// Rewrites every sidecar under plugins/ (`*.norms.json`, `*.traps.json`) in the canonical layout that
// check-norms requires: two-space structure, every value inside an entry on one line. The content never
// changes. The rules live in format-sidecars.logic.ts and sidecar-layout.logic.ts. Run from the repository
// root: `pnpm run format:sidecars`.
// Exit codes: 0 done, 1 a sidecar is not valid JSON, 2 not run from the repository root.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { isSidecarPath, planRewrites } from "./format-sidecars.logic.ts";
import type { SidecarFile } from "./format-sidecars.logic.ts";

const root = process.cwd();
const plugins = join(root, "plugins");

if (!existsSync(plugins)) {
  console.error("format-sidecars: no plugins/ directory here; run it from the repository root");
  process.exit(2);
}

/** Every sidecar under a directory, skipping `node_modules` and symbolic links. */
function sidecars(dir: string, found: SidecarFile[] = []): SidecarFile[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") sidecars(path, found);
    else if (entry.isFile() && isSidecarPath(entry.name)) {
      found.push({ path: relative(root, path).split(sep).join("/"), text: readFileSync(path, "utf8") });
    }
  }
  return found;
}

const files = sidecars(plugins);
const { rewrites, invalid } = planRewrites(files);
for (const { path, text } of rewrites) {
  writeFileSync(join(root, path), text);
  console.log(`rewrote ${path}`);
}
for (const path of invalid) console.error(`error: ${path} is not valid JSON; fix it by hand`);
console.log(`format-sidecars: ${rewrites.length} of ${files.length} sidecar(s) rewritten`);
if (invalid.length > 0) process.exit(1);
