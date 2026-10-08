---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/metrics/prices\.ts:(?:9|10|11|12|13))`? \| [^|\n]+ \| (?:change) \|'
---
