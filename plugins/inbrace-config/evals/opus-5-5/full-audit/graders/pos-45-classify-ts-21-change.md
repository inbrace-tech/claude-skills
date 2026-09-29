---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/intake/classify\.ts:(?:19|20|21|22|23))`? \| [^|\n]+ \| (?:change) \|'
---
