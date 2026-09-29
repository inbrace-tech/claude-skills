---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:docs/claude/models\.md:(?:5|6|7|8|9))`? \| [^|\n]+ \| (?:change) \|'
---
