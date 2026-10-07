"""Weekly digest job, kept for the archive export; not scheduled since the move to the nightly report."""

import anthropic

client = anthropic.Anthropic()

LEGACY_MODEL = "claude-3-5-haiku-20241022"


def weekly_digest(text: str) -> str:
    response = client.messages.create(
        model=LEGACY_MODEL,
        max_tokens=2000,
        messages=[{"role": "user", "content": f"Write a weekly digest of these tickets:\n\n{text}"}],
    )
    return "".join(block.text for block in response.content if block.type == "text")
