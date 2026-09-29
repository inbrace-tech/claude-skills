---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/review/stream-view\.ts:(?:13))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
