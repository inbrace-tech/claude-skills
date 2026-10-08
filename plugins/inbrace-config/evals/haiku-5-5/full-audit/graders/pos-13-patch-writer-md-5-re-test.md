---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/patch-writer\.md:(?:4|5))`? \| [^|\n]+ \| (?:re-test) \|'
---
