---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/support-bot\.md:\d+)`? \| [^|\n]+ \| (?:optional) \|'
---
