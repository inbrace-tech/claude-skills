---
name: haiku-5-5-headless-without-scope
description: A headless audit given no --scope or --mode cannot ask for them, so it must stop at the plan, change nothing, and name the arguments that would have reached the report (transition-audit N15).
tags: [haiku-5-5, cheap]
model: claude-opus-5-5
max_turns: 60
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite]
---

/inbrace-config:audit-haiku-5-5 --stop-at-report
