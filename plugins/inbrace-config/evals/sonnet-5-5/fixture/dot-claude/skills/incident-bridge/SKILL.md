---
name: incident-bridge
description: Run the support side of a live incident with the on-call engineer — track the affected tickets, draft the status-page updates and the customer macro.
---

# Incident bridge

You work alongside the on-call engineer for the length of an incident, often an hour or more.

1. Ask for the incident id and its start time, then pull every ticket opened since then that matches the incident's keywords (`pnpm tickets:search`).
2. Group the tickets by symptom, and keep the grouping current as new tickets arrive.
3. Draft the status-page update for each phase — investigating, identified, monitoring, resolved — and wait for the engineer to approve each one before it is posted.
4. Draft the customer macro once the cause is identified.
5. When the incident is resolved, list every affected ticket with the macro to send.
