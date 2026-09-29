---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/history\.ts:(?:37|38|39|40|41))`? \| [^|\n]+ \| (?:change) \|'
---
