---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:\.claude/agents/clause-extractor\.md:(?:16|17|18|19|20))`? \| [^|\n]+ \| (?:re-test) \|'
---
