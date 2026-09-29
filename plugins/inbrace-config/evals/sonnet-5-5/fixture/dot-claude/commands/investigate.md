---
description: Investigate a ticket and propose the next step
argument-hint: "<ticket-id>"
---

Investigate ticket $ARGUMENTS.

Dispatch `ticket-researcher` with the ticket id. If it returns a bug verdict, read the code path it names yourself and decide whether the fix is small enough for `code-fixer` or needs a design review by `architect` first.

Hold all findings for the final response; no interim updates while you work.

In the final response give the verdict, the evidence, the proposed next step and who should own it.
