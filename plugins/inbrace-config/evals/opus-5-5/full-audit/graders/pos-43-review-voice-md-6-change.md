---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/rules/shared/review-voice\.md:(?:4|5|6|7|8))`? \| [^|\n]+ \| (?:change) \|'
---
