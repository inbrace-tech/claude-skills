"""EU tenants: reads invoices from the billing admin portal through Amazon Bedrock in eu-west-1."""

from anthropic import AnthropicBedrock

from .portal_bridge import perform_action

client = AnthropicBedrock(aws_region="eu-west-1")

MODEL = "anthropic.claude-sonnet-5"

COMPUTER_TOOL = {
    "type": "computer_20251124",
    "name": "computer",
    "display_width_px": 1440,
    "display_height_px": 900,
}


def read_invoices(account_id: str) -> str:
    messages = [
        {
            "role": "user",
            "content": (
                f"Open https://billing-admin.example.com/accounts/{account_id}/invoices and list every invoice "
                "with its date, amount and status. Do not click any button that changes the account."
            ),
        }
    ]
    for _ in range(30):
        with client.beta.messages.stream(
            model=MODEL,
            max_tokens=32000,
            betas=["computer-use-2025-11-24"],
            tools=[COMPUTER_TOOL],
            tool_choice={"type": "auto"},
            messages=messages,
        ) as stream:
            response = stream.get_final_message()

        if response.stop_reason == "refusal":
            raise RuntimeError(f"request declined for account {account_id}")
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            return "".join(block.text for block in response.content if block.type == "text")

        results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if block.name == "computer":
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": perform_action(block.input)})
            else:
                results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "is_error": True,
                        "content": f"Unknown tool {block.name!r}; the only tool is computer.",
                    }
                )
        messages.append({"role": "user", "content": results})
    raise RuntimeError(f"invoices for {account_id} not read within 30 steps")
