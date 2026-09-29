---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/model-notes-opus-5/SKILL\.md:(?:15|16|17|18|19))`? \| [^|\n]+ \| (?:re-test) \|'
---
