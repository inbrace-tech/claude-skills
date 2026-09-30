#!/usr/bin/env node
// Checks that every skill and agent in the norm format (`- [Nxx]` items in SKILL.md or
// agents/<name>.md) agrees with its `.norms.json` sidecar, that every sidecar is in the canonical layout
// of sidecar-layout.logic.ts, that every surface fits its size ceiling,
// and that every knowledge file (`skills/<skill>/transitions/<slug>.md`) agrees with its format and
// its `.traps.json` sidecar. The rules live in check-norms.logic.ts; this file finds the files and
// reports. Run from the repository root: `pnpm run check-norms`.
// Exit codes: 0 consistent, 1 inconsistent, 2 not run from the repository root.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  agentNames,
  checkCorpus,
  checkKnowledge,
  checkSurface,
  knowledgeSlugs,
  positionalArgumentErrors,
  sidecarLayoutErrors,
  sidecarPathFor,
  sizeErrors,
  toRepoPath,
  trapsSidecarPathFor,
} from "./check-norms.logic.ts";
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

/** Every knowledge file under a skill's `transitions/`, found by its `.md` or its `.traps.json`. */
function knowledgeFiles(): string[] {
  const found: string[] = [];
  for (const plugin of readdirSync(plugins, { withFileTypes: true })) {
    if (!plugin.isDirectory()) continue;
    const skills = join(plugins, plugin.name, "skills");
    if (!existsSync(skills)) continue;
    for (const skill of readdirSync(skills, { withFileTypes: true })) {
      const transitions = join(skills, skill.name, "transitions");
      if (!skill.isDirectory() || !existsSync(transitions)) continue;
      const files = readdirSync(transitions, { withFileTypes: true }).filter((entry) => entry.isFile());
      for (const slug of knowledgeSlugs(files.map((entry) => entry.name))) found.push(join(transitions, `${slug}.md`));
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
  if (input.surface !== null) errors.push(...sizeErrors(input.surfacePath, input.surface, kind));
  if (input.surface !== null && kind === "skill") errors.push(...positionalArgumentErrors(input.surfacePath, input.surface));
  // An orphan sidecar is reported as such; its layout is judged once it has a surface.
  if (input.surface !== null && input.sidecarText !== null) errors.push(...sidecarLayoutErrors(input.sidecarPath, input.sidecarText));
  const result = checkSurface(input);
  if (!result.inFormat) continue;
  checked[kind] += 1;
  errors.push(...result.errors);
}

const knowledge = knowledgeFiles();
for (const path of knowledge) {
  const trapsText = readIfPresent(trapsSidecarPathFor(path));
  if (trapsText !== null && existsSync(path)) errors.push(...sidecarLayoutErrors(toRepoPath(relative(root, trapsSidecarPathFor(path)), sep), trapsText));
  errors.push(
    ...checkKnowledge({
      path: toRepoPath(relative(root, path), sep),
      sidecarPath: toRepoPath(relative(root, trapsSidecarPathFor(path)), sep),
      source: readIfPresent(path),
      sidecarText: readIfPresent(trapsSidecarPathFor(path)),
    }),
  );
}

const corpus = checkCorpus({ surfaces: inputs, markdown: markdownFiles() });
errors.push(...corpus.errors);
for (const note of corpus.notes) console.log(`note: ${note}`);

const counted = `${checked.skill} skill(s) and ${checked.agent} agent(s)`;
if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-norms: ${errors.length} error(s) across ${counted} and ${knowledge.length} knowledge file(s)`);
  process.exit(1);
}
console.log(`check-norms: ${counted} in the norm format and ${knowledge.length} knowledge file(s), all consistent`);
