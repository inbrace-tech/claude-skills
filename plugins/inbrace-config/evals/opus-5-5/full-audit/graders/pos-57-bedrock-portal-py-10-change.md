---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/bedrock_portal\.py:(?:8|9|10|11|12))`? \| [^|\n]+ \| (?:change) \|'
---
