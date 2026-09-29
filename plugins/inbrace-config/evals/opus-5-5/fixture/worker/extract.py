"""Clause extraction for signed contracts (worker job `extract`)."""

from .client import MODEL, client

CLAUSE_TOOL = {
    "name": "record_clauses",
    "description": "Record the clauses found in the contract text.",
    "input_schema": {
        "type": "object",
        "properties": {
            "clauses": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "section": {"type": "string"},
                        "type": {"type": "string"},
                        "text": {"type": "string"},
                    },
                    "required": ["section", "type", "text"],
                },
            }
        },
        "required": ["clauses"],
    },
}

SYSTEM = "You extract clauses from vendor contracts into the clause schema in schemas/clause-types.json."


def count_request_tokens(text: str) -> int:
    """Used by the batch planner to split a re-extraction into requests that fit the budget."""
    return client.messages.count_tokens(
        model=MODEL,
        system=SYSTEM,
        tools=[CLAUSE_TOOL],
        tool_choice={"type": "any"},
        messages=[{"role": "user", "content": text}],
    ).input_tokens


def extract(text: str) -> list[dict]:
    response = client.messages.create(
        model=MODEL,
        thinking={"type": "disabled"},
        max_tokens=16000,
        system=SYSTEM,
        tools=[CLAUSE_TOOL],
        tool_choice={"type": "any"},
        messages=[{"role": "user", "content": text}],
    )
    call = next(block for block in response.content if block.type == "tool_use")
    return call.input["clauses"]
