---
name: redline-session
description: Work through a vendor's redline with the reviewer, clause by clause, and agree the counter-proposal.
---

# Redline session

You work through the vendor's redline with the reviewer, often for an hour or more.

1. Load the vendor's redline (`pnpm redline:show <id>`) and the playbook positions for each clause type.
2. For each changed clause, show the vendor's text, the playbook position and a proposed counter, and wait for the reviewer's decision.
3. Record each decision in `negotiations/<id>.md`.
4. When every clause is decided, draft the counter-proposal.
5. Before you finish, add a final verification step: dispatch a subagent to re-check every counter against the playbook.
