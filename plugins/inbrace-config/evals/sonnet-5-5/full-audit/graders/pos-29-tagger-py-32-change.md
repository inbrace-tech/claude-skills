---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/tagger\.py:(?:30|31|32|33|34))`? \| [^|\n]+ \| (?:change) \|'
---
