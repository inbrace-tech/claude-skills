---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/portal-ui/SKILL\.md:(?:8|9|10|11|12))`? \| [^|\n]+ \| (?:change) \|'
---
