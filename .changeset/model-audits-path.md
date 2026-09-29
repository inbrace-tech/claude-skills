---
"inbrace-config": patch
---

The audit writes each run to `.model-audits/<target>-<date>/`, ignored by git, instead of the protected `.claude/`, so it runs without per-file prompts and headless.
