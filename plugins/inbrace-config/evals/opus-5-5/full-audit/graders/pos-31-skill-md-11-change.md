---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/skills/summarize-contract/SKILL\.md:(?:9|10|11|12|13))`? \| [^|\n]+ \| (?:change) \|'
---
