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
//   - an entry lacks a non-empty `where` or `what`, its `where` names no
//     heading of the surface, or `refs` is not an object keyed by `owner/repo`
//     (arrays of positive integers) or `docs` (arrays of https URLs);
//   - a `[<skill-or-agent>#N01]` citation, on a surface, in a sidecar's prose
//     or in any Markdown file, names no single surface or no norm it declares;
//   - a bare `[N01]` sits in a Markdown file no sidecar serves, outside code.
// Issue numbers a `what` cites that `refs` does not list, and the reverse, are
// printed as notes and do not fail the run.
// A surface with no norm and no sidecar is not in the format and is skipped.
// It finds `plugins/*/skills/*/SKILL.md` and `plugins/*/agents/*.md`, each
// with its sidecar, and reads every Markdown file under the root. The rules
// are ported from the norm-provenance checker of Inbrace's internal agent
// harness; check-norms.logic.ts says what came across and what was left out.
// The rules live there; this file finds the files, prints and sets the exit
// code: 0 consistent, 1 inconsistent,
// 2 not run from the repository root. Node 24 runs it as is, stripping the
// types, with no build and no runtime dependency: run it from the repository
// root with `pnpm run check-norms` or `node scripts/check-norms.ts`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { agentNames, checkCorpus, checkSurface, sidecarPathFor, toRepoPath } from "./check-norms.logic.ts";
import type { MarkdownFile, SurfaceInput } from "./check-norms.logic.ts";

const root = process.cwd();
const plugins = join(root, "plugins");

if (!existsSync(plugins)) {
  console.error("check-norms: no plugins/ directory here; run it from the repository root");
  process.exit(2);
}

type Kind = "skill" | "agent";

interface Surface {
  kind: Kind;
  /** Absolute path to the surface. */
  path: string;
}

/**
 * Every surface to check: `plugins/<plugin>/skills/<skill>/SKILL.md` for each
 * skill directory, and `plugins/<plugin>/agents/<name>.md` for each agent name
 * found by its `.md` or its `.norms.json`. Stray files are skipped.
 */
function surfaces(): Surface[] {
  const found: Surface[] = [];
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

/**
 * Every Markdown file under the repository root, for the corpus checks.
 * Skipped: `node_modules`, `.git`, and `.claude/worktrees`, where Claude Code
 * keeps other checkouts of this same repository. A symbolic link is skipped
 * too; its target is read under its own name.
 */
function markdownFiles(dir: string = root, found: MarkdownFile[] = []): MarkdownFile[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const repoPath = toRepoPath(relative(root, path), sep);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || repoPath === ".claude/worktrees") continue;
      markdownFiles(path, found);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      found.push({ path: repoPath, source: readFileSync(path, "utf8") });
    }
  }
  return found;
}

const readIfPresent = (path: string): string | null => (existsSync(path) ? readFileSync(path, "utf8") : null);
const errors: string[] = [];
const checked: Record<Kind, number> = { skill: 0, agent: 0 };
const inputs: SurfaceInput[] = [];

for (const { kind, path: surfacePath } of surfaces()) {
  const sidecarPath = sidecarPathFor(surfacePath);
  const input: SurfaceInput = {
    surfacePath: toRepoPath(relative(root, surfacePath), sep),
    sidecarPath: toRepoPath(relative(root, sidecarPath), sep),
    surface: readIfPresent(surfacePath),
    sidecarText: readIfPresent(sidecarPath),
  };
  inputs.push(input);
  const result = checkSurface(input);
  if (!result.inFormat) continue;
  checked[kind] += 1;
  errors.push(...result.errors);
}

const corpus = checkCorpus({ surfaces: inputs, markdown: markdownFiles() });
errors.push(...corpus.errors);
for (const note of corpus.notes) console.log(`note: ${note}`);

const counted = `${checked.skill} skill(s) and ${checked.agent} agent(s)`;
if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-norms: ${errors.length} error(s) across ${counted}`);
  process.exit(1);
}
console.log(`check-norms: ${counted} in the norm format, all consistent`);
