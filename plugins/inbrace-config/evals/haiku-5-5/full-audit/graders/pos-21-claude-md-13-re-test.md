---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:CLAUDE\.md:(?:13))`? \| [^|\n]+ \| (?:re-test) \|'
---
