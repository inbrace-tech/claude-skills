---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/model-notes-opus-5/SKILL\.md:(?:10|11|12|13|14))`? \| [^|\n]+ \| (?:re-test) \|'
---
