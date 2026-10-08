---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/extract\.py:(?:23))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
