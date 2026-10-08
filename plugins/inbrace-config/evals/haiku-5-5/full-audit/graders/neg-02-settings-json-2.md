---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/settings\.json:(?:2))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
