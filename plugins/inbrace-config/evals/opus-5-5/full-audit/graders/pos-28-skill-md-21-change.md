---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/model-notes-opus-5/SKILL\.md:(?:19|20|21|22|23))`? \| [^|\n]+ \| (?:change) \|'
---
