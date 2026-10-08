---
name: triage-ticket
description: Triage one help-desk ticket end to end — tag it, route it and draft the first reply.
---

# Triage a ticket

1. Start the `ticket-tagger` agent on the ticket and wait for its tag line.
2. Route the ticket with `.claude/rules/model-routing.md` and the tag.
3. Draft the first reply in the support voice: short, plain, no promises about dates.
4. Classify the ticket's sentiment as positive, neutral or negative, in one word.

For a batch, run it headless with one launch per ticket:

```bash
claude -p "/triage-ticket $TICKET" --model claude-haiku-4-5 --output-format json
```
