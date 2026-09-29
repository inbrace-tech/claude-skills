#!/usr/bin/env node
// PreToolUse (Agent): remind the model of the delegation policy before it starts a subagent.
// Never blocks the call; it only adds context.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const settings = JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8"));
const model = process.env.ANTHROPIC_MODEL ?? settings.model ?? "";

const OPUS_5_POLICY =
  "Delegate to a subagent only for large tasks that are genuinely independent and parallelizable. " +
  "Do not use subagents to verify or double-check your own work, and keep spawn counts low.";

if (/^claude-opus-5/.test(model)) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: OPUS_5_POLICY },
    }),
  );
}
