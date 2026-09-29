---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/check-agent-models\.mjs:(?:19))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
