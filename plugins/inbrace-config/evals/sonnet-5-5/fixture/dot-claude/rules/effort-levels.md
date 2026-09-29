---
paths:
  - ".claude/agents/**"
  - ".claude/skills/**"
---

# Choosing an effort level for an agent or skill

The levels below were measured on Claude Sonnet 5 when the agents were written, and they carry over unchanged to later Sonnet releases: a level means the same amount of thinking from one release to the next.

| Work | Effort |
|---|---|
| Lookups, summaries, lint fixes | `low` |
| Bounded investigation, single-file fixes | `medium` |
| Multi-file changes, releases | `high` |
| The hardest refactors | `xhigh` |

Set `effort:` explicitly in every new agent rather than relying on the session's level.
