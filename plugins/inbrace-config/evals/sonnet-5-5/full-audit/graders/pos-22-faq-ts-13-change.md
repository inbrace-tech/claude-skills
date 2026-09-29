---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/faq\.ts:(?:11|12|13|14|15))`? \| [^|\n]+ \| (?:change) \|'
---
