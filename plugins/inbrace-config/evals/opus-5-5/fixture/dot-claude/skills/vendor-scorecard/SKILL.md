---
name: vendor-scorecard
description: Build a vendor's annual scorecard from delivery records, disputes and price history.
model: claude-opus-5-5
effort: high  # unchanged since the skill ran on claude-opus-5
---

# Vendor scorecard

1. Pull the vendor's delivery records and disputes for the year with `pnpm vendors:history <id> --year <yyyy>`.
2. Score delivery, quality, responsiveness and price stability from 1 to 5, with the records behind each score.
3. Compare the scores with last year's scorecard in `scorecards/`.
4. Write the scorecard to `scorecards/<id>-<yyyy>.md`.
