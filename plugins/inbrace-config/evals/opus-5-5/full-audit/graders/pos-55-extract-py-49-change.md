---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/extract\.py:(?:47|48|49|50|51))`? \| [^|\n]+ \| (?:change) \|'
---
