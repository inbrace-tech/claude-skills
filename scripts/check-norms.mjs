#!/usr/bin/env node
// Checks that every skill and agent written in the norm format agrees with its
// sidecar.
//
// A surface in that format — a skill's `SKILL.md` or an agent's
// `agents/<name>.md` — states each rule as one list item led by its id,
// `- [N01] ...`, and carries a sidecar beside it recording why each rule
// exists: `SKILL.norms.json` for a skill, `<name>.norms.json` for an agent.
// This script fails when the two drift apart:
//   - a norm in the surface has no sidecar entry, or a sidecar entry no norm;
//   - an id is defined twice, or is not N followed by two digits;
//   - a `[Nxx]` cross-reference names an id the surface does not define;
//   - a sidecar has no surface beside it, is not a JSON object, or its
//     `surface` does not name the surface beside it;
//   - an entry lacks a non-empty `where` or `what`, or `refs` is not an object.
// A surface with no norm and no sidecar is not in the format and is skipped.
// It finds `plugins/*/skills/*/SKILL.md` and `plugins/*/agents/*.md`, each
// with its sidecar. The rules live in check-norms.logic.mjs; this file finds
// the surfaces, prints and sets the exit code: 0 consistent, 1 inconsistent,
// 2 not run from the repository root. Plain Node, no dependencies: run it from
// the repository root with `node scripts/check-norms.mjs`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { agentNames, checkSurface, sidecarPathFor, toRepoPath } from "./check-norms.logic.mjs";

const root = process.cwd();
const plugins = join(root, "plugins");

if (!existsSync(plugins)) {
  console.error("check-norms: no plugins/ directory here; run it from the repository root");
  process.exit(2);
}

/**
 * Every surface to check, as `{ kind, path }`: `plugins/<plugin>/skills/<skill>/SKILL.md`
 * for each skill directory, and `plugins/<plugin>/agents/<name>.md` for each
 * agent name found by its `.md` or its `.norms.json`. Stray files are skipped.
 */
function surfaces() {
  const found = [];
  for (const plugin of readdirSync(plugins, { withFileTypes: true })) {
    if (!plugin.isDirectory()) continue;
    const skills = join(plugins, plugin.name, "skills");
    if (existsSync(skills)) {
      for (const skill of readdirSync(skills, { withFileTypes: true })) {
        if (skill.isDirectory()) found.push({ kind: "skill", path: join(skills, skill.name, "SKILL.md") });
      }
    }
    const agents = join(plugins, plugin.name, "agents");
    if (existsSync(agents)) {
      const files = readdirSync(agents, { withFileTypes: true }).filter((entry) => entry.isFile());
      for (const name of agentNames(files.map((entry) => entry.name))) {
        found.push({ kind: "agent", path: join(agents, `${name}.md`) });
      }
    }
  }
  return found;
}

const readIfPresent = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null);
const errors = [];
const checked = { skill: 0, agent: 0 };

for (const { kind, path: surfacePath } of surfaces()) {
  const sidecarPath = sidecarPathFor(surfacePath);
  const result = checkSurface({
    surfacePath: toRepoPath(relative(root, surfacePath), sep),
    sidecarPath: toRepoPath(relative(root, sidecarPath), sep),
    surface: readIfPresent(surfacePath),
    sidecarText: readIfPresent(sidecarPath),
  });
  if (!result.inFormat) continue;
  checked[kind] += 1;
  errors.push(...result.errors);
}

const counted = `${checked.skill} skill(s) and ${checked.agent} agent(s)`;
if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-norms: ${errors.length} error(s) across ${counted}`);
  process.exit(1);
}
console.log(`check-norms: ${counted} in the norm format, all consistent`);
