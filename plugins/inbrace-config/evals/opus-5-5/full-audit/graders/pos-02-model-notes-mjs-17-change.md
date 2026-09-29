---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/claude-hooks/model-notes\.mjs:(?:15|16|17|18|19)|scripts/claude-hooks/model-notes\.mjs:(?:10|11|12|13|14))`? \| [^|\n]+ \| (?:change) \|'
---
