---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/agent-routing\.md:(?:12))`? \| [^|\n]+ \| (?:re-test) \|'
---
