---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/review/redline-loop\.ts:(?:49|50|51|52|53))`? \| [^|\n]+ \| (?:change) \|'
---
