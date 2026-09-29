---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/claude-hooks/model-notes\.mjs:(?:9|10|11|12|13))`? \| [^|\n]+ \| (?:re-test) \|'
---
