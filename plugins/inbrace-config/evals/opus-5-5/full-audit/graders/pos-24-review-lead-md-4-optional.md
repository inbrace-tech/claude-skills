---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/review-lead\.md:(?:2|3|4|5|6)|\.claude/agents/review-lead\.md:(?:7|8|9|10|11))`? \| [^|\n]+ \| (?:optional) \|'
---
