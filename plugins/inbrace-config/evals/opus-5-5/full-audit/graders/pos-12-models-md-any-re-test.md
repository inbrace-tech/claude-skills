---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:docs/claude/models\.md:\d+|\.claude/settings\.json:(?:1|2|3|4|5))`? \| [^|\n]+ \| (?:re-test) \|'
---
