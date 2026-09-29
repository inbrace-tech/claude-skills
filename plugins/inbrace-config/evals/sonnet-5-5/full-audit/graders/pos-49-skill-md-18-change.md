---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/model-notes-sonnet-5/SKILL\.md:(?:16|17|18|19|20))`? \| [^|\n]+ \| (?:change) \|'
---
