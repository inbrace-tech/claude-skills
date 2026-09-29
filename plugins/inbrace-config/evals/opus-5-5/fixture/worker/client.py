"""The worker's one Claude API client; every job imports it from here."""

import os

import anthropic

client = anthropic.Anthropic()

MODEL = os.environ.get("CONTRACT_DESK_MODEL", "claude-opus-5")


def text_of(message) -> str:
    return "".join(block.text for block in message.content if block.type == "text")
