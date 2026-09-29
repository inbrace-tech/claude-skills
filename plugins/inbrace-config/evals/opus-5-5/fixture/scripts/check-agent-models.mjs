#!/usr/bin/env node
// `pnpm check:agents`: an agent that preloads a model-notes skill must preload the one for its model.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), ".claude", "agents");
let failed = false;

function notesFor(model) {
  if (/^claude-opus-5/.test(model)) return "model-notes-opus-5";
  return null;
}

for (const file of readdirSync(dir).filter((name) => name.endsWith(".md"))) {
  const text = readFileSync(join(dir, file), "utf8");
  const front = text.split("---")[1] ?? "";
  const lines = front.split("\n").map((line) => line.trim());

  const model = (lines.find((line) => line.startsWith("model:")) ?? "").slice(6).trim();
  const skills = lines.filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim());
  const notes = skills.filter((skill) => skill.startsWith("model-notes-"));
  const expected = notesFor(model);

  if (notes.length > 0 && expected && !notes.includes(expected)) {
    console.error(`${file}: model ${model} needs ${expected} in skills:, found ${notes.join(", ")}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
