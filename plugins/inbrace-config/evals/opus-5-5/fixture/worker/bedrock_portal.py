"""Reads the EU vendors' portals from the EU account (worker job `eu-portal`).

EU contract data stays in the EU account, so this job runs only on Amazon Bedrock in eu-west-1.
"""

from anthropic import AnthropicBedrock

bedrock = AnthropicBedrock(aws_region="eu-west-1")

BEDROCK_MODEL = "anthropic.claude-opus-5"


def portal_step(messages: list[dict]):
    return bedrock.beta.messages.create(
        model=BEDROCK_MODEL,
        max_tokens=8000,
        betas=["computer-use-2025-11-24"],
        tools=[{"type": "computer_20251124", "name": "computer", "display_width_px": 1280, "display_height_px": 800}],
        messages=messages,
    )
