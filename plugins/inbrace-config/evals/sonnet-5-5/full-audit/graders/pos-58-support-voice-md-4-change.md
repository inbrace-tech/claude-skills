---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/shared/support-voice\.md:(?:4))`? \| [^|\n]+ \| (?:change) \|'
---
