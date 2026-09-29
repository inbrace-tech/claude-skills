---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:docs/claude/environments\.md:(?:17))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
