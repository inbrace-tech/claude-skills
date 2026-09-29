"""Second opinion on refund decisions above the auto-approve limit."""

from .client import ask, text_of

SYSTEM = (
    "You review a proposed refund against the refund policy and the account history. "
    "Say whether to approve it, reduce it or decline it, and why."
)

ADVISOR_TOOL = {"type": "advisor_20260301", "name": "advisor", "model": "claude-opus-4-8"}


def review_refund(case_text: str) -> dict:
    response = ask(
        SYSTEM,
        [{"role": "user", "content": case_text}],
        effort="high",
        max_tokens=8000,
        betas=["advisor-tool-2026-03-01"],
        tools=[ADVISOR_TOOL],
    )
    advisor_notes = [block.content.text for block in response.content if block.type == "advisor_tool_result"]
    return {"decision": text_of(response), "advisor_notes": advisor_notes}
