"""The one place worker jobs reach the Claude API."""

import os

import anthropic

MODEL = "claude-sonnet-5"

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def ask(system, messages, *, effort="high", max_tokens=4096, betas=None, output_format=None, **extra):
    system_blocks = [{"type": "text", "text": system}]
    # Caching only pays off on long prompts.
    if len(system) // 4 >= 1024:
        system_blocks[0]["cache_control"] = {"type": "ephemeral"}

    output_config = {"effort": effort}
    if output_format is not None:
        output_config["format"] = output_format

    if betas:
        return client.beta.messages.create(
            model=MODEL,
            betas=betas,
            system=system_blocks,
            messages=messages,
            max_tokens=max_tokens,
            output_config=output_config,
            **extra,
        )
    return client.messages.create(
        model=MODEL,
        system=system_blocks,
        messages=messages,
        max_tokens=max_tokens,
        output_config=output_config,
        **extra,
    )


def text_of(response):
    return "".join(block.text for block in response.content if block.type == "text")
