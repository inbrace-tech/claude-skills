---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/triage/classify\.ts:(?:28|29|30|31|32))`? \| [^|\n]+ \| (?:change) \|'
---
