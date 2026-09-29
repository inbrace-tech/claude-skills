---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/release-notes-researcher\.md:(?:4))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
