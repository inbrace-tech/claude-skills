---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/lib/claude\.ts:(?:27))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
