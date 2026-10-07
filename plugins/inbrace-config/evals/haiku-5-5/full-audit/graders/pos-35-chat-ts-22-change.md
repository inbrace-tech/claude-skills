---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/chat\.ts:(?:22|30))`? \| [^|\n]+ \| (?:change) \|'
---
