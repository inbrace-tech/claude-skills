#!/usr/bin/env node
// PostToolUse: count tool calls per session and tell the model how many remain.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BUDGET = Number(process.env.SUPPORTDESK_TOOL_BUDGET ?? 150);
const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const dir = join(tmpdir(), "supportdesk-tool-budget");
mkdirSync(dir, { recursive: true });
const counter = join(dir, `${input.session_id ?? "unknown"}.count`);

let used = 0;
try {
  used = Number(readFileSync(counter, "utf8")) || 0;
} catch {
  used = 0;
}
used += 1;
writeFileSync(counter, String(used));

const left = Math.max(BUDGET - used, 0);
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `Tool budget: ${left} of ${BUDGET} calls left in this session.`,
    },
  }),
);
