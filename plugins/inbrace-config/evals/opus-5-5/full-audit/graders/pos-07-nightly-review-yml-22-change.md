---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.github/workflows/nightly-review\.yml:(?:20|21|22|23|24))`? \| [^|\n]+ \| (?:change) \|'
---
