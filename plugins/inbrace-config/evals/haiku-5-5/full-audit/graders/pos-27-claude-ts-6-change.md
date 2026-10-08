---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/lib/claude\.ts:(?:6))`? \| [^|\n]+ \| (?:change) \|'
---
