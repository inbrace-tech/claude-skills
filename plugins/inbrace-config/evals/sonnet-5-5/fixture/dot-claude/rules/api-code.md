---
paths:
  - "src/**/*.ts"
  - "worker/**/*.py"
---

# Claude API code

- Every call goes through `src/lib/claude.ts` or `worker/client.py`; never construct a second client.
- Set `temperature: 0` on every classification call so labels are stable between runs.
- For a JSON answer to a task with several steps, end the system prompt with "Think the problem through before you answer."
- Handle `stop_reason: "max_tokens"` as a failed call and retry it once.
