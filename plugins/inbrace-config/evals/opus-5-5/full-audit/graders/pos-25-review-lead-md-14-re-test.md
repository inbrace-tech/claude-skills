---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/review-lead\.md:(?:12|13|14|15|16))`? \| [^|\n]+ \| (?:re-test) \|'
---
