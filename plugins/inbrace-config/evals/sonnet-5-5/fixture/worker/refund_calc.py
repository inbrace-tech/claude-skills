"""Computes the refund owed on a cancelled subscription under the published refund policy."""

import json

from .client import ask, text_of

POLICY = """P1 — Monthly plans: no refund for the current month after 7 days from the renewal date.
P2 — Annual plans: pro-rated refund of the unused whole months, minus any discount applied at purchase.
P3 — Credits already issued on the account are deducted from the refund.
P4 — A refund never exceeds the amount paid for the current term."""

SYSTEM = """You compute the refund owed on a cancelled subscription under the policy below.

{policy}

Think the problem through before you answer."""

REFUND_SCHEMA = {
    "type": "object",
    "properties": {
        "refund_cents": {"type": "integer"},
        "rules_applied": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["refund_cents", "rules_applied"],
    "additionalProperties": False,
}


def compute_refund(case: dict) -> dict:
    response = ask(
        SYSTEM.replace("{policy}", POLICY),
        [{"role": "user", "content": json.dumps(case)}],
        effort="high",
        max_tokens=16000,
        thinking={"type": "adaptive"},
        output_format={"type": "json_schema", "schema": REFUND_SCHEMA},
    )
    if response.stop_reason == "max_tokens":
        raise RuntimeError("refund computation stopped at max_tokens; retry the case")
    return json.loads(text_of(response))
