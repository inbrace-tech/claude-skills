---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/redline-drafter\.md:(?:2|3|4|5|6))`? \| [^|\n]+ \| (?:change) \|'
---
