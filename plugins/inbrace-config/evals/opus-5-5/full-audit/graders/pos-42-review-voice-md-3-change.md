---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/shared/review-voice\.md:(?:1|2|3|4|5))`? \| [^|\n]+ \| (?:change) \|'
---
