---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/architect\.md:(?:5))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
