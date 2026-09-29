---
name: escalation-review
description: Walk through the week's escalated tickets with the support lead and agree on follow-ups.
---

# Weekly escalation review

You go through the week's escalated tickets with the support lead, one at a time.

Before your first tool call, say in one line which tickets you are about to pull; after the last ticket, give a three-line recap of the follow-ups agreed.

1. Pull the tickets escalated in the last seven days with `pnpm tickets:search --escalated --since 7d`.
2. For each ticket, summarise it, show what the assistant drafted, and ask the lead whether it needs a follow-up.
3. Record each agreed follow-up in `docs/escalations/<week>.md`.
