# Agent guide

This repository is a public Claude Code plugin marketplace. Read `CONTRIBUTING.md` before changing anything.

## Hard constraints

- Every skill cites the official Anthropic documentation for each claim it makes about model behavior.
- Every skill's invocation mode is a deliberate choice, recorded in the README's Skills table: `disable-model-invocation: true` for side-effecting or occasional skills, unset for skills Claude should start when a task matches.
- Nothing private: no internal repository names, URLs, credentials or customer data.
- A new plugin is added to `.claude-plugin/marketplace.json` in the same change.
- Every skill and every plugin agent is written in the norm format described in `CONTRIBUTING.md` › Writing a skill: `- [Nxx]` imperative norms in `SKILL.md` or `agents/<name>.md`, their history in `SKILL.norms.json` or `<name>.norms.json`, ids never renumbered or reused. An agent never cites another surface's norms, and keeps its return contract in its own XML container.

## Checks

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run check-norms
pnpm audit --audit-level=high
claude plugin validate --strict .
claude plugin validate --strict plugins/<plugin>
claude plugin validate --strict plugins/<plugin>/skills
claude plugin validate --strict plugins/<plugin>/agents
```
