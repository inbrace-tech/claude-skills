---
name: renewal-review
description: Walk through the month's upcoming renewals with the procurement lead and agree what to renew, renegotiate or terminate.
---

# Monthly renewal review

You go through the contracts renewing next month with the procurement lead, one at a time.

Before your first tool call, say in one line which renewals you are about to pull; after the last one, give a three-line recap of what was agreed.

1. Pull the contracts renewing next month with `pnpm renewals:list --month next`.
2. For each contract, show the spend, the risk score and any price change announced, and ask the lead for a decision.
3. Record each decision in `renewals/<month>.md`.
