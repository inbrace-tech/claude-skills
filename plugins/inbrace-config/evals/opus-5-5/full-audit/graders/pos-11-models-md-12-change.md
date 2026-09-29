---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:docs/claude/models\.md:(?:10|11|12|13|14))`? \| [^|\n]+ \| (?:change) \|'
---
