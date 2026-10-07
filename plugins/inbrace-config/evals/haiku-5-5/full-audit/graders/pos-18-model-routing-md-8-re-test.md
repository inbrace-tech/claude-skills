---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/model-routing\.md:(?:8|9))`? \| [^|\n]+ \| (?:re-test) \|'
---
