---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/triage-queue/SKILL\.md:(?:15))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
