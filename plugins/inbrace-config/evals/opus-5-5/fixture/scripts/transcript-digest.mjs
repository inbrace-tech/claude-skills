#!/usr/bin/env node
// `pnpm digest <session.jsonl>`: turn a Claude Code session transcript into the Markdown digest
// the team reads in the weekly review — what the assistant told the reviewer, turn by turn.
import { readFileSync } from "node:fs";

const [path] = process.argv.slice(2);
if (!path) {
  console.error("usage: pnpm digest <session.jsonl>");
  process.exit(1);
}

const out = [];
for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
  const entry = JSON.parse(line);
  if (entry.type !== "assistant") continue;
  for (const block of entry.message?.content ?? []) {
    if (block.type === "text") out.push(block.text.trim());
  }
}

process.stdout.write(`# Session digest\n\n${out.map((text) => `- ${text}`).join("\n")}\n`);
