---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/extract\.py:(?:43|44|45|46|47))`? \| [^|\n]+ \| (?:change) \|'
---
