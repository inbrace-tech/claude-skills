"""Applies taxonomy tags to tickets; the historical backfill calls the same function."""

from .client import MODEL, ask, client

SYSTEM = "Tag the support ticket with every taxonomy tag that applies. Use only tags from the enum."

TAG_TOOL = {
    "name": "apply_tags",
    "description": "Apply taxonomy tags to the ticket.",
    "input_schema": {
        "type": "object",
        "properties": {
            "tags": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["billing", "refund", "login", "sso", "export", "api", "performance", "bug", "feature-request"],
                },
            }
        },
        "required": ["tags"],
        "additionalProperties": False,
    },
}


def estimate_tokens(ticket_text: str) -> int:
    count = client.messages.count_tokens(
        model=MODEL,
        system=SYSTEM,
        tools=[TAG_TOOL],
        tool_choice={"type": "any"},
        messages=[{"role": "user", "content": ticket_text}],
    )
    return count.input_tokens


def tag_ticket(ticket_text: str) -> list[str]:
    response = ask(
        SYSTEM,
        [{"role": "user", "content": ticket_text}],
        effort="medium",
        max_tokens=1024,
        tools=[TAG_TOOL],
        tool_choice={"type": "any"},
    )
    call = next(block for block in response.content if block.type == "tool_use")
    return call.input["tags"]
