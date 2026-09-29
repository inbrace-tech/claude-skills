---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/model-notes-sonnet-5/SKILL\.md:(?:13))`? \| [^|\n]+ \| (?:re-test) \|'
---
