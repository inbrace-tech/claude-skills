# Model routing

Pick the model for an agent or an Agent call from this table.

| Work | Model | Why |
|---|---|---|
| Planning across modules | `claude-opus-5-5` | Needs the deepest reasoning |
| Ticket tagging | `haiku` | Cheap and fast; tags need no reasoning |
| FAQ lookups | `haiku` | Cheap enough to run on every question |
| Security log review | `haiku` | Haiku never refuses a request, so it suits raw attack logs |

Haiku costs $1 per million input tokens and $5 per million output tokens, a fifth of Sonnet's price; budget batch jobs at that rate.
