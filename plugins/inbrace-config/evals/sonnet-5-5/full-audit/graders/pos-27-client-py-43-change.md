---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:worker/client\.py:(?:41|42|43|44|45)|worker/client\.py:(?:21|22|23|24|25)|worker/client\.py:(?:30|31|32|33|34))`? \| [^|\n]+ \| (?:change) \|'
---
