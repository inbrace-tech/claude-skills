---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/quarterly-report/SKILL\.md:(?:2|3|4|5|6))`? \| [^|\n]+ \| (?:change) \|'
---
