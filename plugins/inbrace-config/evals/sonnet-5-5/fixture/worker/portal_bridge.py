"""Forwards computer-use actions to the headless browser bridge on the EU worker host."""

import json
import os
import urllib.request

BRIDGE = os.environ.get("VNC_BRIDGE_URL", "http://127.0.0.1:6080")


def perform_action(action: dict) -> list:
    request = urllib.request.Request(
        f"{BRIDGE}/action",
        data=json.dumps(action).encode(),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read())
