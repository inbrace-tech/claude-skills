---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/ask-contract/SKILL\.md:(?:6|7|8|9|10))`? \| [^|\n]+ \| (?:optional) \|'
---
