---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/reply-loop\.ts:(?:47|48|49|50|51))`? \| [^|\n]+ \| (?:change) \|'
---
