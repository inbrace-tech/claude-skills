---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/ticket-researcher\.md:\d+)`? \| [^|\n]+ \| (?:optional) \|'
---
