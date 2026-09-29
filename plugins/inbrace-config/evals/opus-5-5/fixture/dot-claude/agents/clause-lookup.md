---
name: clause-lookup
description: Returns the definition of a clause type from the clause schema.
model: claude-sonnet-5-5
effort: low
tools: Read, Grep
---

Do not think before answering: look the clause type up in `schemas/clause-types.json` and return its definition verbatim.

If the type is not in the schema, return `unknown type` and the three closest type names.
