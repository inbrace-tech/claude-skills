---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/diagram_reader\.py:(?:16))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
