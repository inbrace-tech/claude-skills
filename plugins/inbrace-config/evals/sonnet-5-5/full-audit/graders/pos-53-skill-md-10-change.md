---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/customer-reply/SKILL\.md:(?:8|9|10|11|12))`? \| [^|\n]+ \| (?:change) \|'
---
