#!/usr/bin/env node
// SessionStart: add the team's notes for the session's model to the context.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const model = typeof input.model === "string" ? input.model : "";
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

function notesFor(id) {
  if (id.startsWith("claude-sonnet-5")) return "model-notes-sonnet-5";
  return null;
}

const skill = notesFor(model);
const path = skill ? join(root, ".claude", "skills", skill, "SKILL.md") : null;
if (!path || !existsSync(path)) process.exit(0);

const body = readFileSync(path, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: body },
  }),
);
