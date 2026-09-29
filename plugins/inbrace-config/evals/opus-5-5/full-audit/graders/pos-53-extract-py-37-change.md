---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/extract\.py:(?:35|36|37|38|39))`? \| [^|\n]+ \| (?:change) \|'
---
