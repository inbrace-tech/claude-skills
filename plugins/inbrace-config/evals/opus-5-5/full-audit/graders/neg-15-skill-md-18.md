---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/bulk-reextract/SKILL\.md:(?:18))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
