---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/commands/review-pr\.md:(?:8))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
