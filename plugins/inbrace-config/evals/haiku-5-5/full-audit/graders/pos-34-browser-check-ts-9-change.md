---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/portal/browser-check\.ts:(?:7|8|9|10|11))`? \| [^|\n]+ \| (?:change) \|'
---
