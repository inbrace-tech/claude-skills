---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/ticket-researcher\.md:(?:3|4|5|6|7))`? \| [^|\n]+ \| (?:re-test) \|'
---
