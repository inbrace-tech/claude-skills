---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/triage-ticket/SKILL\.md:(?:16))`? \| [^|\n]+ \| (?:change) \|'
---
