---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:CLAUDE\.md:(?:19|20|21|22|23))`? \| [^|\n]+ \| (?:re-test) \|'
---
