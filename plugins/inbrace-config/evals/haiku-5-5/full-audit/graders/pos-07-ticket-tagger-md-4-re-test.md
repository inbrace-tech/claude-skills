---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/ticket-tagger\.md:(?:4))`? \| [^|\n]+ \| (?:re-test) \|'
---
