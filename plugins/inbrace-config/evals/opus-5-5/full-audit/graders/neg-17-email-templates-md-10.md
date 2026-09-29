---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/email-templates\.md:(?:10))`? \| [^|\n]+ \| (?:change|re-test|optional) \|'
match: not_contains
---
