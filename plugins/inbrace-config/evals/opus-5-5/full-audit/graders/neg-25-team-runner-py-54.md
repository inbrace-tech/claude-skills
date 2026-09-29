---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/team_runner\.py:(?:54))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
