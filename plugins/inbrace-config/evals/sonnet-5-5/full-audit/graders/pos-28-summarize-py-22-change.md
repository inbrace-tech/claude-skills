---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/summarize\.py:(?:20|21|22|23|24))`? \| [^|\n]+ \| (?:change) \|'
---
