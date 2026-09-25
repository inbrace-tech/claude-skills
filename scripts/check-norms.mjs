#!/usr/bin/env node
// Checks that every skill written in the norm format agrees with its sidecar.
//
// A skill in that format states each rule as one list item led by its id,
// `- [N01] ...`, and carries a `SKILL.norms.json` beside it recording why each
// rule exists. This script fails when the two drift apart:
//   - a norm in SKILL.md has no sidecar entry, or a sidecar entry no norm;
//   - an id is defined twice, or is not N followed by two digits;
//   - a `[Nxx]` cross-reference names an id the skill does not define;
//   - the sidecar is not a JSON object, or its `surface` does not name the
//     SKILL.md beside it;
//   - an entry lacks a non-empty `where` or `what`, or `refs` is not an object.
// A SKILL.md with no norm and no sidecar is not in the format and is skipped.
// The rules live in check-norms.logic.mjs; this file finds the skills, prints
// and sets the exit code. Plain Node, no dependencies: run it from the
// repository root with `node scripts/check-norms.mjs`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { checkSkill } from "./check-norms.logic.mjs";

const root = process.cwd();

/** Every `plugins/<plugin>/skills/<skill>/` directory; stray files are skipped. */
function skillDirs() {
  const plugins = join(root, "plugins");
  if (!existsSync(plugins)) return [];
  const dirs = [];
  for (const plugin of readdirSync(plugins, { withFileTypes: true })) {
    if (!plugin.isDirectory()) continue;
    const skills = join(plugins, plugin.name, "skills");
    if (!existsSync(skills)) continue;
    for (const skill of readdirSync(skills, { withFileTypes: true })) {
      if (skill.isDirectory()) dirs.push(join(skills, skill.name));
    }
  }
  return dirs;
}

const errors = [];
let checked = 0;

for (const dir of skillDirs()) {
  const surfacePath = join(dir, "SKILL.md");
  if (!existsSync(surfacePath)) continue;
  const sidecarPath = join(dir, "SKILL.norms.json");
  const result = checkSkill({
    surfacePath: relative(root, surfacePath),
    sidecarPath: relative(root, sidecarPath),
    surface: readFileSync(surfacePath, "utf8"),
    sidecarText: existsSync(sidecarPath) ? readFileSync(sidecarPath, "utf8") : null,
  });
  if (!result.inFormat) continue;
  checked += 1;
  errors.push(...result.errors);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-norms: ${errors.length} error(s) across ${checked} skill(s)`);
  process.exit(1);
}
console.log(`check-norms: ${checked} skill(s) in the norm format, all consistent`);
