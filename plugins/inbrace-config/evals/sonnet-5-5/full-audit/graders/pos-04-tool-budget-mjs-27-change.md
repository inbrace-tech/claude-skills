---
type: regex
target: { source: file, path: .eval-findings.md }
pattern: '## Final list[\s\S]*\n(?:- )?`?(?:scripts/claude-hooks/tool-budget\.mjs:(?:25|26|27|28|29)|\.claude/settings\.json:(?:38|39|40|41|42))`? \| [^|\n]+ \| (?:change) \|'
---
