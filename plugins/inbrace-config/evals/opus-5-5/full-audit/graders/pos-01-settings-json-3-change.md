---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/settings\.json:(?:1|2|3|4|5))`? \| [^|\n]+ \| (?:change) \|'
---
