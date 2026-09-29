---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/check-agent-models\.mjs:(?:8|9|10|11|12))`? \| [^|\n]+ \| (?:re-test) \|'
---
