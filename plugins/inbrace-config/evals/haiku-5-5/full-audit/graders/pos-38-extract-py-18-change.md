---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/extract\.py:(?:16|17|18|19|20|21))`? \| [^|\n]+ \| (?:change) \|'
---
