---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:src/portal/vendor-portal-agent\.ts:(?:28|29|30|31|32))`? \| [^|\n]+ \| (?:change) \|'
---
