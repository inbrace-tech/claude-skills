#!/usr/bin/env node
// Checks that every skill written in the norm format agrees with its sidecar.
//
// A skill in that format states each rule as one list item led by its id,
// `- [N01] ...`, and carries a `SKILL.norms.json` beside it recording why each
// rule exists. This script fails when the two drift apart:
//   - a norm in SKILL.md has no sidecar entry, or a sidecar entry no norm;
//   - an id is defined twice, or is not N followed by two digits;
//   - a `[Nxx]` cross-reference names an id the skill does not define;
//   - the sidecar's `surface` does not name the SKILL.md beside it;
//   - an entry lacks a non-empty `where` or `what`, or `refs` is not an object.
// A SKILL.md with no norm and no sidecar is not in the format and is skipped.
// Plain Node, no dependencies: run it with `node scripts/check-norms.mjs`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const definition = /^- \[(N\d{2})\] /;
const reference = /\[(N\d{2})\]/g;

function skillDirs() {
  const plugins = join(root, "plugins");
  if (!existsSync(plugins)) return [];
  const dirs = [];
  for (const plugin of readdirSync(plugins)) {
    const skills = join(plugins, plugin, "skills");
    if (!existsSync(skills)) continue;
    for (const skill of readdirSync(skills)) dirs.push(join(skills, skill));
  }
  return dirs;
}

const errors = [];
let checked = 0;

for (const dir of skillDirs()) {
  const surfacePath = join(dir, "SKILL.md");
  const sidecarPath = join(dir, "SKILL.norms.json");
  if (!existsSync(surfacePath)) continue;
  const surface = readFileSync(surfacePath, "utf8");
  const rel = relative(root, surfacePath);

  const defined = [];
  for (const line of surface.split("\n")) {
    const match = line.match(definition);
    if (match) defined.push(match[1]);
  }
  const hasSidecar = existsSync(sidecarPath);
  if (defined.length === 0 && !hasSidecar) continue;
  checked += 1;

  if (!hasSidecar) {
    errors.push(`${rel}: defines norms but has no SKILL.norms.json`);
    continue;
  }

  let sidecar;
  try {
    sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));
  } catch (error) {
    errors.push(`${relative(root, sidecarPath)}: invalid JSON (${error.message})`);
    continue;
  }

  if (sidecar.surface !== rel) {
    errors.push(`${relative(root, sidecarPath)}: surface is "${sidecar.surface}", expected "${rel}"`);
  }

  const seen = new Set();
  for (const id of defined) {
    if (seen.has(id)) errors.push(`${rel}: norm ${id} is defined more than once`);
    seen.add(id);
  }

  const entries = Array.isArray(sidecar.norms) ? sidecar.norms : [];
  if (!Array.isArray(sidecar.norms)) errors.push(`${relative(root, sidecarPath)}: "norms" must be an array`);
  const recorded = new Set();
  for (const entry of entries) {
    const id = entry?.id;
    if (typeof id !== "string" || !/^N\d{2}$/.test(id)) {
      errors.push(`${relative(root, sidecarPath)}: entry with invalid id ${JSON.stringify(id)}`);
      continue;
    }
    if (recorded.has(id)) errors.push(`${relative(root, sidecarPath)}: ${id} is recorded more than once`);
    recorded.add(id);
    if (typeof entry.where !== "string" || entry.where.trim() === "") errors.push(`${relative(root, sidecarPath)}: ${id} has no "where"`);
    if (typeof entry.what !== "string" || entry.what.trim() === "") errors.push(`${relative(root, sidecarPath)}: ${id} has no "what"`);
    if (typeof entry.refs !== "object" || entry.refs === null || Array.isArray(entry.refs)) errors.push(`${relative(root, sidecarPath)}: ${id} "refs" must be an object`);
  }

  for (const id of seen) if (!recorded.has(id)) errors.push(`${rel}: ${id} has no entry in SKILL.norms.json`);
  for (const id of recorded) if (!seen.has(id)) errors.push(`${relative(root, sidecarPath)}: ${id} matches no norm in SKILL.md`);

  for (const match of surface.matchAll(reference)) {
    if (!seen.has(match[1])) errors.push(`${rel}: cross-reference [${match[1]}] names no norm defined here`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-norms: ${errors.length} error(s) across ${checked} skill(s)`);
  process.exit(1);
}
console.log(`check-norms: ${checked} skill(s) in the norm format, all consistent`);
