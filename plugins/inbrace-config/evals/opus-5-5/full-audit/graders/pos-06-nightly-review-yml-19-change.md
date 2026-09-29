---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.github/workflows/nightly-review\.yml:(?:17|18|19|20|21))`? \| [^|\n]+ \| (?:change) \|'
---
