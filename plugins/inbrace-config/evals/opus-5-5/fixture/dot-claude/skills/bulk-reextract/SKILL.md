---
name: bulk-reextract
description: Re-extract the clause files of historical contracts after the clause schema changes.
---

# Bulk re-extraction

A re-extraction touches thousands of contracts, so it runs in headless sessions, one per year of contracts, never in this one.

1. Split the range in the request into calendar years, and write them as a checklist in `reports/reextract-plan.md`.
2. For each year, start a headless session:

```bash
claude -p --model claude-opus-5 --max-turns 80 "Re-extract the contracts signed in <YYYY> with worker/extract.py, tick <YYYY> off in reports/reextract-plan.md, and write the counts to reports/reextract-<YYYY>.json"
```

3. Check the plan after each session.
4. When a session ends with its year still unticked and no blocker stated, resume it with `claude -p --resume <session> "Continue: <YYYY> is still open."`; stop after two continuations and report the year as stuck.
5. When every year is ticked, sum the counts and report the totals per clause type.
