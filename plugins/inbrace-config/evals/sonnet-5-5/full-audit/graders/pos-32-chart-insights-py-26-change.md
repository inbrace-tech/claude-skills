---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/chart_insights\.py:(?:24|25|26|27|28))`? \| [^|\n]+ \| (?:change) \|'
---
