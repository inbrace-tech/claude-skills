---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/redline-session/SKILL\.md:\d+)`? \| [^|\n]+ \| (?:optional) \|'
---
