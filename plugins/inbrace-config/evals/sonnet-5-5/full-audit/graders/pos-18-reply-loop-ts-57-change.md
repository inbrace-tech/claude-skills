---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/reply-loop\.ts:(?:55|56|57|58|59))`? \| [^|\n]+ \| (?:change) \|'
---
