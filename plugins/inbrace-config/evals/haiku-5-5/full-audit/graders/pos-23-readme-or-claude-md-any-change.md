---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:README\.md:\d+|CLAUDE\.md:\d+)`? \| [^|\n]+ \| (?:change) \|'
---
