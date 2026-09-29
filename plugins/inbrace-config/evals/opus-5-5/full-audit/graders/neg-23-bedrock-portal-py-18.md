---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/bedrock_portal\.py:(?:18))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
