---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/settings\.json:(?:4))`? \| [^|\n]+ \| (?:change) \|'
---
