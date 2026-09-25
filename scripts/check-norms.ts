#!/usr/bin/env node
// Checks that every skill and agent in the norm format (`- [Nxx]` items in SKILL.md or
// agents/<name>.md) agrees with its `.norms.json` sidecar. The rules live in check-norms.logic.ts;
// this file finds the files and reports. Run from the repository root: `pnpm run check-norms`.
// Exit codes: 0 consistent, 1 inconsistent, 2 not run from the repository root.

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

/** Every skill's SKILL.md and every agent's `.md` under plugins/, an agent found by its `.md` or its `.norms.json`. */
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
 * Every Markdown file under the root, skipping `node_modules`, `.git`, `.claude/worktrees` (other
 * checkouts of this repository) and symbolic links, whose targets are read under their own name.
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
