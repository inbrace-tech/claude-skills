---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/redline-session/SKILL\.md:(?:14))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
