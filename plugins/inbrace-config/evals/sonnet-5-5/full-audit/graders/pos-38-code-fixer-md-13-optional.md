---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/code-fixer\.md:(?:13)|\.claude/agents/code-fixer\.md:(?:4))`? \| [^|\n]+ \| (?:optional) \|'
---
