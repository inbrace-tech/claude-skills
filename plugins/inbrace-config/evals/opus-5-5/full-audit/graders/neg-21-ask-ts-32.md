---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/chat/ask\.ts:(?:32))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
