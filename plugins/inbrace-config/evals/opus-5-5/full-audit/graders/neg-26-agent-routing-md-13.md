---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/agent-routing\.md:(?:13))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
