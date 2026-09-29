---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/code-fixer\.md:(?:15))`? \| [^|\n]+ \| (?:optional) \|'
---
