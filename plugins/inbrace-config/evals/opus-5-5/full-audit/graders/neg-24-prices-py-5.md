---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/prices\.py:(?:5))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
