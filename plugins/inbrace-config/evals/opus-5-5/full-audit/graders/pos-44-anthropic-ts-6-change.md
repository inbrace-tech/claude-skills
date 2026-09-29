---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/lib/anthropic\.ts:(?:4|5|6|7|8))`? \| [^|\n]+ \| (?:change) \|'
---
