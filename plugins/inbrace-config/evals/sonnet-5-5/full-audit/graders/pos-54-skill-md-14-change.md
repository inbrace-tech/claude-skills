---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/backfill-tags/SKILL\.md:(?:12|13|14|15|16))`? \| [^|\n]+ \| (?:change) \|'
---
