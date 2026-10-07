---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/commands/plan-release\.md:(?:7))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
