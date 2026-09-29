---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/billing/model-prices\.ts:(?:1|2|3|4|5)|src/billing/model-prices\.ts:(?:7|8|9|10|11))`? \| [^|\n]+ \| (?:change) \|'
---
