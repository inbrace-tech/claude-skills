# Agent guide

This repository is a public Claude Code plugin marketplace. Read `CONTRIBUTING.md` before changing anything.

## Hard constraints

- Every skill cites the official Anthropic documentation for each claim it makes about model behavior.
- Every skill's invocation mode is a deliberate choice, recorded in the README's Skills table: `disable-model-invocation: true` for side-effecting or occasional skills, unset for skills Claude should start when a task matches.
- Nothing private: no internal repository names, URLs, credentials or customer data.
- A new plugin is added to `.claude-plugin/marketplace.json` in the same change.

## Checks

```bash
claude plugin validate --strict .
claude plugin validate --strict plugins/<plugin>
claude plugin validate --strict plugins/<plugin>/skills
```
