---
name: quarterly-report
description: Build the quarterly procurement report — contracts signed, savings against list price, obligations due next quarter.
model: claude-opus-5
effort: high
disable-model-invocation: true
---

# Quarterly procurement report

1. List the contracts signed in the quarter with `pnpm contracts:list --signed <quarter>`.
2. For each, take the negotiated price and the vendor's list price from the clause file and compute the saving.
3. List the obligations due next quarter from the obligations calendar.
4. Write the report to `reports/quarterly-<quarter>.md` with one table per section.
