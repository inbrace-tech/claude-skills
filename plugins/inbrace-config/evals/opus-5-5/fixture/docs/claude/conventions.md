# Conventions for sessions and agents

## Dispatching agents

- Dispatch the extraction and drafting agents with an explicit model: `Agent({ subagent_type: "clause-extractor", model: "claude-opus-5", prompt })`.
- Put the contract id and the reviewer's question in the prompt; agents never read the reviewer queue themselves.
- One agent per contract; a bundle goes to `review-lead`, which splits it.

## Branches and pull requests

- One pull request per contract-template change; keep its scope to that template.
- Name branches `review/<ticket>`.
- A change to `schemas/clause-types.json` needs a re-extraction plan in its pull request.
