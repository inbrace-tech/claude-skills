"""Extracts order numbers and product names from ticket bodies."""

import json

import anthropic

client = anthropic.Anthropic()

MODEL = "claude-haiku-4-5"

PROMPT = "Extract every order number and product name from the ticket. Reply with JSON only."


def extract(ticket: str) -> dict:
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        temperature=0.2,
        top_k=40,
        system=PROMPT,
        messages=[{"role": "user", "content": ticket}],
    )
    if response.stop_reason == "refusal":
        return {"orders": [], "products": [], "refused": True}
    text = "".join(block.text for block in response.content if block.type == "text")
    return json.loads(text)
