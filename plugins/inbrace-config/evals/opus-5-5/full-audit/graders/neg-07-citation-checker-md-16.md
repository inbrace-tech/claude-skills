---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/citation-checker\.md:(?:16))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
