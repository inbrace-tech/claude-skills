---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/history\.ts:(?:18|19|20|21|22))`? \| [^|\n]+ \| (?:optional) \|'
---
