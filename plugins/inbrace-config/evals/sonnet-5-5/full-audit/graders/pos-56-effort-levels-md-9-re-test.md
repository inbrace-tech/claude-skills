---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/effort-levels\.md:(?:7|8|9|10|11))`? \| [^|\n]+ \| (?:re-test) \|'
---
