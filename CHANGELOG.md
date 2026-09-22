# Changelog

## claude-config

### 0.2.0

- Rename `/claude-config:audit` to `/claude-config:audit-opus-5-5` and scope it to the Opus 5 → 5.5 transition. It now audits in context-sized batches, writes a report file, asks what to change, and applies only the approved changes.

### 0.1.0

- Add `/claude-config:audit`, which audits `CLAUDE.md`, rules, agents, skills and settings for instructions outdated by Claude Opus 5 and 5.5.
