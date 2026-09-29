"""A reviewer's long-running question session over one contract bundle (worker job `session`)."""

import subprocess

from .client import MODEL, client, text_of

SEARCH_TOOL = {
    "name": "search_bundle",
    "description": "Full-text search over the documents of the bundle.",
    "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
}

PRICING_TOOL = {
    "name": "pricing_history",
    "description": "Return the price history of a vendor from the Finance ledger.",
    "input_schema": {"type": "object", "properties": {"vendor_id": {"type": "string"}}, "required": ["vendor_id"]},
}

COMMANDS = {"search_bundle": ("bundle:search", "query"), "pricing_history": ("ledger:prices", "vendor_id")}


def run_tool(bundle_id: str, name: str, tool_input: dict) -> str:
    script, field = COMMANDS[name]
    args = ["pnpm", "--silent", script, *([bundle_id] if name == "search_bundle" else []), tool_input[field]]
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout


class ReviewSession:
    def __init__(self, bundle_id: str):
        self.bundle_id = bundle_id
        self.system = f"You answer a procurement reviewer's questions about contract bundle {bundle_id}."
        self.tools = [SEARCH_TOOL]
        self.messages: list[dict] = []

    def unlock_pricing(self) -> None:
        """Called when Finance grants the reviewer ledger access partway through the session."""
        self.tools.append(PRICING_TOOL)

    def ask(self, question: str) -> str:
        self.messages.append({"role": "user", "content": question})
        while True:
            response = client.messages.create(
                model=MODEL,
                max_tokens=8000,
                system=self.system,
                tools=self.tools,
                messages=self.messages,
            )
            self.messages.append({"role": "assistant", "content": response.content})
            if response.stop_reason != "tool_use":
                return text_of(response)
            results = [
                {"type": "tool_result", "tool_use_id": block.id, "content": run_tool(self.bundle_id, block.name, block.input)}
                for block in response.content
                if block.type == "tool_use"
            ]
            self.messages.append({"role": "user", "content": results})
