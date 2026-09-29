---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/shared/support-voice\.md:(?:3))`? \| [^|\n]+ \| (?:change) \|'
---
