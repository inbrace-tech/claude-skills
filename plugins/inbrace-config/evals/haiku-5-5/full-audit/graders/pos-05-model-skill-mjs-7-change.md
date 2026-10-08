---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/claude-hooks/model-skill\.mjs:(?:5|6|7|8|9|10|11|12|13|14))`? \| [^|\n]+ \| (?:change) \|'
---
