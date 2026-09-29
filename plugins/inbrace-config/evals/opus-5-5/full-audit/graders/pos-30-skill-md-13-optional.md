---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/ask-contract/SKILL\.md:(?:11|12|13|14|15))`? \| [^|\n]+ \| (?:optional) \|'
---
