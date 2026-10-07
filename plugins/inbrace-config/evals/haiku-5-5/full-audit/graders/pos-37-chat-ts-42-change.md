---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/chat\.ts:(?:40|41|42|43|44))`? \| [^|\n]+ \| (?:change) \|'
---
