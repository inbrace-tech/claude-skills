---
name: sonnet-5-5-bad-argument
description: An audit started with a value outside --scope's must stop before reading anything and show the usage line with the token at fault (transition-audit N02).
tags: [sonnet-5-5, cheap]
model: claude-opus-5-5
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite]
---

/inbrace-config:audit-sonnet-5-5 --scope everything --stop-at-report
