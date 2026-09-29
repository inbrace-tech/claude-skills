---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/client\.py:(?:7|8|9|10|11))`? \| [^|\n]+ \| (?:change) \|'
---
