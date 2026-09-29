---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/commands/explain-clause\.md:(?:1|2|3|4|5))`? \| [^|\n]+ \| (?:change) \|'
---
