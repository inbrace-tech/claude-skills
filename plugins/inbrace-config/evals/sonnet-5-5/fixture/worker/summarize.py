"""Nightly job: summarise long ticket threads for whoever picks the ticket up next."""

from .client import ask, text_of

SYSTEM = (
    "Summarise the support thread for the next agent: the customer's problem, what was tried, "
    "what was promised, and what is still open. Four bullets at most."
)

PREFIX = "- Problem:"


def summarize_thread(thread_text: str) -> str:
    response = ask(
        SYSTEM,
        [
            {"role": "user", "content": thread_text},
            {"role": "assistant", "content": PREFIX},
        ],
        effort="low",
        max_tokens=600,
        thinking={"type": "disabled"},
    )
    return PREFIX + text_of(response)
