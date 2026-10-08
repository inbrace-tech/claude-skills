---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/triage/classify\.ts:(?:11))`? \| [^|\n]+ \| (?:change) \|'
---
