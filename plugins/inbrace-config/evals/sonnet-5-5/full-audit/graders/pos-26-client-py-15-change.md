---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/client\.py:(?:13|14|15|16|17))`? \| [^|\n]+ \| (?:change) \|'
---
