"""Reads the network diagrams customers attach to connectivity tickets."""

import base64
import io

from PIL import Image

from .client import ask, text_of

SYSTEM = (
    "You read a customer's network diagram and answer the support agent's question about it: "
    "which hosts sit behind which gateway, and which ports the diagram shows open. "
    "Crop into any region whose labels are too small to read at full size."
)

CROP_TOOL = {
    "name": "crop_image",
    "description": "Crop the attached diagram to a box given in pixels and return the crop at full resolution.",
    "input_schema": {
        "type": "object",
        "properties": {
            "left": {"type": "integer"},
            "top": {"type": "integer"},
            "right": {"type": "integer"},
            "bottom": {"type": "integer"},
        },
        "required": ["left", "top", "right", "bottom"],
        "additionalProperties": False,
    },
}


def _crop(png_bytes: bytes, box: dict) -> dict:
    image = Image.open(io.BytesIO(png_bytes)).crop((box["left"], box["top"], box["right"], box["bottom"]))
    out = io.BytesIO()
    image.save(out, format="PNG")
    data = base64.standard_b64encode(out.getvalue()).decode()
    return {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": data}}


def read_diagram(png_bytes: bytes, question: str) -> str:
    data = base64.standard_b64encode(png_bytes).decode()
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": data}},
                {"type": "text", "text": question},
            ],
        }
    ]
    for _ in range(8):
        response = ask(
            SYSTEM,
            messages,
            effort="high",
            max_tokens=16000,
            tools=[CROP_TOOL],
            tool_choice={"type": "auto"},
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            return text_of(response)

        results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if block.name.lower() == "crop_image":
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": [_crop(png_bytes, block.input)]})
            else:
                results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "is_error": True,
                        "content": f"Unknown tool {block.name!r}; the only tool is crop_image.",
                    }
                )
        messages.append({"role": "user", "content": results})
    return text_of(response)
