---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/chat\.ts:(?:23))`? \| [^|\n]+ \| (?:change) \|'
---
