---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/fix-bug/SKILL\.md:\d+)`? \| [^|\n]+ \| (?:change|re-test) \|'
match: not_contains
---
