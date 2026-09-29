---
name: explain-invoice
description: Explain a customer's invoice line by line so a support agent can answer a billing question.
---

# Explain an invoice

Fetch the invoice with `pnpm billing:invoice <id>` and explain each line: the plan, proration, credits and taxes.

- Include your reasoning in the response so the agent can check how you reached each amount.
- Round to cents only at the end, and show the unrounded figure where rounding changes the total.
- If a line doesn't match the plan's price list, flag it; don't guess why.
