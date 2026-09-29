---
name: backfill-tags
description: Re-tag historical tickets after the tag taxonomy changes.
---

# Backfill ticket tags

A backfill touches tens of thousands of tickets, so it runs in headless sessions, one per month of history, never in this one.

1. Split the range in the request into calendar months.
2. For each month, start a headless session:

```bash
claude -p --model claude-sonnet-5 --max-turns 60 "Re-tag the tickets created in <YYYY-MM> with worker/tagger.py and write the counts to reports/backfill-<YYYY-MM>.json"
```

3. When every session has finished, sum the counts and report the totals per tag.
