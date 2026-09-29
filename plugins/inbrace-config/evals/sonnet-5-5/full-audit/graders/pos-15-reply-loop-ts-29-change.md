---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/reply-loop\.ts:(?:27|28|29|30|31))`? \| [^|\n]+ \| (?:change) \|'
---
