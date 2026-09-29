---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/transcript-digest\.mjs:(?:15|16|17|18|19))`? \| [^|\n]+ \| (?:re-test) \|'
---
