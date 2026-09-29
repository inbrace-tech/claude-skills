---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:CLAUDE\.md:(?:19|20|21|22|23)|\.claude/skills/fix-bug/SKILL\.md:\d+)`? \| [^|\n]+ \| (?:optional) \|'
---
