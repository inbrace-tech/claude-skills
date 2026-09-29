"""The due-diligence team (worker job `diligence`): a lead agent that delegates reading to two readers.

The lead's only tool is `delegate`, which runs a reader on one document and returns its notes.
"""

import time

from .client import MODEL, client

BUDGET_S = 1200

DELEGATE_TOOL = {
    "name": "delegate",
    "description": "Have a reader agent read one document of the data room and return its notes.",
    "input_schema": {
        "type": "object",
        "properties": {"document": {"type": "string"}, "question": {"type": "string"}},
        "required": ["document", "question"],
    },
}

LEAD_SYSTEM = (
    "You lead a due-diligence review of a vendor's data room. "
    "Delegate each document to a reader with the delegate tool, then write the findings."
)


def run_reader(document: str, question: str) -> str:
    response = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        system="You read one document of a vendor's data room and answer the lead's question with quotes.",
        messages=[{"role": "user", "content": f"{question}\n\nDocument: {document}"}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


def run_lead(question: str) -> list[dict]:
    started = time.monotonic()
    messages: list[dict] = [{"role": "user", "content": question}]
    for _ in range(30):
        response = client.messages.create(
            model=MODEL, max_tokens=16000, system=LEAD_SYSTEM, tools=[DELEGATE_TOOL], messages=messages
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            break
        results = [
            {"type": "tool_result", "tool_use_id": block.id, "content": run_reader(**block.input)}
            for block in response.content
            if block.type == "tool_use"
        ]
        elapsed = int(time.monotonic() - started)
        messages.append({"role": "user", "content": [*results, {"type": "text", "text": f"elapsed {elapsed}s / {BUDGET_S}s"}]})
    return messages
