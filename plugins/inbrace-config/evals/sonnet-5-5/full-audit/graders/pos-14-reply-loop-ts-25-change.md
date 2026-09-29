---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/assistant/reply-loop\.ts:(?:23|24|25|26|27))`? \| [^|\n]+ \| (?:change) \|'
---
