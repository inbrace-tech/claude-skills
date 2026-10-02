---
"inbrace-config": patch
---

The Sonnet eval fixture's sample clients no longer read `ANTHROPIC_API_KEY` themselves and leave it to the SDK; the plugin directory's validation held that read for review.
