---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/reply-loop\.ts:(?:36|37|38|39|40))`? \| [^|\n]+ \| (?:change) \|'
---
