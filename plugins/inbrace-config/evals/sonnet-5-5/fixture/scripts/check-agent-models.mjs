#!/usr/bin/env node
// CI check over .claude/agents/*.md: every agent on a model family the team keeps
// notes for must bind those notes through its `skills:` list, and the notes must exist.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const AGENTS_DIR = ".claude/agents";
const SKILLS_DIR = ".claude/skills";

const NOTES_BY_MODEL = [{ pattern: /^claude-sonnet-5/, skill: "model-notes-sonnet-5" }];

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { model: null, skills: [] };
  const lines = match[1].split("\n");
  const model = lines.find((l) => l.startsWith("model:"))?.slice("model:".length).trim() ?? null;
  const skills = [];
  const start = lines.findIndex((l) => l.startsWith("skills:"));
  if (start !== -1) {
    for (const line of lines.slice(start + 1)) {
      const item = line.match(/^\s+-\s+(.+)$/);
      if (!item) break;
      skills.push(item[1].trim());
    }
  }
  return { model, skills };
}

let failures = 0;
for (const file of readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"))) {
  const { model, skills } = frontmatter(readFileSync(join(AGENTS_DIR, file), "utf8"));
  if (!model) continue;
  for (const { pattern, skill } of NOTES_BY_MODEL) {
    if (!pattern.test(model)) continue;
    if (!skills.includes(skill)) {
      console.error(`${file}: agents on ${model} must list the ${skill} skill`);
      failures += 1;
    }
    if (!existsSync(join(SKILLS_DIR, skill, "SKILL.md"))) {
      console.error(`${file}: ${skill} is required for ${model} but ${SKILLS_DIR}/${skill}/SKILL.md is missing`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`check-agent-models: ${failures} problem(s)`);
  process.exit(1);
}
console.log("check-agent-models: ok");
