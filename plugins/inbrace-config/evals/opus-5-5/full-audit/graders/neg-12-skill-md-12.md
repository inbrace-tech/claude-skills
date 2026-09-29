---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/model-notes-opus-5-5/SKILL\.md:(?:12))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
