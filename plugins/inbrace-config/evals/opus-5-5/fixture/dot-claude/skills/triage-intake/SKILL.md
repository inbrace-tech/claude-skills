---
name: triage-intake
description: Triage the contract intake queue — label, prioritise and route each new contract.
---

# Triage the intake queue

For each unassigned contract (`pnpm intake:unassigned`):

1. Read the cover sheet and the first page of the contract.
2. Do not think before labelling: skip thinking and apply the first matching label from `intake/labels.md`.
3. Set the priority from the requested signature date with `pnpm intake:label`.
4. Route contracts above 250,000 USD a year to the second-line reviewer and everything else to the intake rota.
