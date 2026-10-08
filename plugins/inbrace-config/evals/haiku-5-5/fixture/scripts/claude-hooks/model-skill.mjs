// SessionStart hook: prints the prompting notes for the session's model, so Claude reads them first.
import { readFileSync } from "node:fs";

const NOTES = [
  ["claude-opus-5-5", ".claude/notes/opus-5-5.md"],
  ["claude-sonnet-5-5", ".claude/notes/sonnet-5-5.md"],
  ["claude-haiku", ".claude/notes/haiku-4-5.md"],
];

const input = JSON.parse(readFileSync(0, "utf8"));
const model = input.model ?? "";
const match = NOTES.find(([prefix]) => model.startsWith(prefix));
if (match) process.stdout.write(readFileSync(match[1], "utf8"));
