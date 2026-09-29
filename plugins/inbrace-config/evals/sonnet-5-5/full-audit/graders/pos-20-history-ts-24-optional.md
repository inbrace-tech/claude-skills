---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/history\.ts:(?:22|23|24|25|26))`? \| [^|\n]+ \| (?:optional) \|'
---
