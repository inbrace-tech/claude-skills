---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/legacy_digest\.py:(?:7))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
