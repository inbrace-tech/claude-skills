"""Weekly insights from the support-operations dashboards.

The dashboards are PNG exports from the metrics stack: stacked bar charts with one series per queue
(fourteen queues), a first-response-time heatmap by hour and weekday, and a backlog line chart per plan.
"""

import base64
from pathlib import Path

from .client import ask, text_of

SYSTEM = (
    "You read support-operations dashboards and report what changed week over week. "
    "Quote the figures you read from the chart, with the series and the week they belong to."
)


def describe_dashboard(png_path: Path, question: str) -> str:
    data = base64.standard_b64encode(png_path.read_bytes()).decode()
    response = ask(
        SYSTEM,
        [
            {
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": data}},
                    {"type": "text", "text": question},
                ],
            }
        ],
        effort="medium",
        max_tokens=2000,
    )
    return text_of(response)
