---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/risk-scorer\.md:(?:6|7|8|9|10))`? \| [^|\n]+ \| (?:change|re-test) \|'
---
