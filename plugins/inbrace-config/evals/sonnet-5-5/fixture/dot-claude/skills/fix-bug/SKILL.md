---
name: fix-bug
description: Fix a reported bug end to end — reproduce, diagnose, fix, verify. Use when the user reports a bug in the service or the worker.
---

# Fix a bug

1. Dispatch `ticket-researcher` with the ticket id and wait for its verdict.
2. If the verdict is not `bug`, report it to the user and stop.
3. Dispatch `code-fixer` with the verdict and the evidence.
4. Review its diff, run `pnpm test` and `pnpm lint` yourself, and open a draft pull request.

Carry the fix through to a green run before you report back; stop to ask only when reproducing the bug needs production data.
