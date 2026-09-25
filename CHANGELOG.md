# Changelog

## claude-config

### 0.3.0

- The audit shows its plan and token cost before reading, reports in the chat, and asks what to apply with a recommendation; P01 now matches how Claude Code sets effort for Opus 5.5, and P20 flags agents still pinned to Opus 5.

### 0.2.0

- Rename `/claude-config:audit` to `/claude-config:audit-opus-5-5` and scope it to the Opus 5 → 5.5 transition. It now audits in context-sized batches, writes a report file, asks what to change, and applies only the approved changes. Findings in Claude API code are handed off to `/claude-api migrate` instead of being edited.

### 0.1.0

- Add `/claude-config:audit`, which audits `CLAUDE.md`, rules, agents, skills and settings for instructions outdated by Claude Opus 5 and 5.5.
