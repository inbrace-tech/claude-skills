---
name: haiku-5-5-full-audit
description: A full, headless Haiku 4.5 → Haiku 5.5 audit of the seeded fixture, stopped at the report. Graded on the report's finding lines against the fixture's key (KEY.md).
tags: [haiku-5-5, full]
model: claude-opus-5-5
max_turns: 200
timeout_seconds: 3600
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite]
---

/inbrace-config:audit-haiku-5-5 --scope full --mode agents --stop-at-report
