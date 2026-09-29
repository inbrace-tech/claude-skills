---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/refund_calc\.py:(?:16))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
