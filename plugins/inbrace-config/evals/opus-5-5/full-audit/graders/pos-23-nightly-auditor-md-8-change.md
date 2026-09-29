---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/nightly-auditor\.md:(?:6|7|8|9|10)|\.claude/agents/nightly-auditor\.md:(?:2|3|4|5|6))`? \| [^|\n]+ \| (?:change) \|'
---
