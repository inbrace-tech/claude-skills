---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/triage/summarize\.ts:(?:14))`? \| [^|\n]+ \| (?:change) \|'
---
