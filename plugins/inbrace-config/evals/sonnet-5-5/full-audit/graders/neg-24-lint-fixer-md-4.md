---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/lint-fixer\.md:(?:4))`? \| [^|\n]+ \| (?:optional) \|'
match: not_contains
---
