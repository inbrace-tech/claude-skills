---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/claude-hooks/delegation-reminder\.mjs:(?:13|14|15|16|17)|scripts/claude-hooks/delegation-reminder\.mjs:(?:10|11|12|13|14))`? \| [^|\n]+ \| (?:re-test) \|'
---
