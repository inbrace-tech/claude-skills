---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/review/redline-loop\.ts:(?:62|63|64|65|66))`? \| [^|\n]+ \| (?:change) \|'
---
