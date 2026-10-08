---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/triage/route\.ts:(?:11))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
