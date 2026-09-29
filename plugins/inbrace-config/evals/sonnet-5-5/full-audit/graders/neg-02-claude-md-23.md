---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:CLAUDE\.md:(?:23))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
