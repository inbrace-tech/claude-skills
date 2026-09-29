---
name: triage-queue
description: Triage the unassigned ticket queue — label, prioritise and route each ticket.
---

# Triage the queue

For each unassigned ticket (`pnpm tickets:unassigned`):

1. Read the thread and the customer's plan.
2. Write out your chain of thought about the ticket's category and urgency before you give the final label.
3. Apply one category label and one priority with `pnpm tickets:label`.
4. Route billing tickets to the billing queue and everything else to tier 1.

After every 3 tool calls, post a one-line progress summary.
