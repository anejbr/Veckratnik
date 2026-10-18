"""Pretvorba posnetka naloge v obliko za učenca – brez rešitev."""

from typing import Any

PUBLIC_FIELDS = ("id", "type", "prompt", "points", "hint", "image_url")


def to_student_view(entry: dict[str, Any]) -> dict[str, Any]:
    view = {field: entry.get(field) for field in PUBLIC_FIELDS}
    match entry["type"]:
        case "single_choice" | "multiple_choice":
            view["options"] = entry["options"]
        case "numeric":
            view["unit"] = entry.get("unit")
        case "fill_blank":
            view["template"] = entry["template"]
        case "compare":
            view.update(left=entry["left"], right=entry["right"])
        case "ordering":
            by_id = {item["id"]: item for item in entry["items"]}
            view.update(items=[by_id[i] for i in entry["presented"]], direction_label=entry["direction_label"])
        case "matching":
            view.update(left=entry["left"], right=entry["right"])
        case "multiples_grid":
            view.update(mode=entry["mode"], number=entry["number"], numbers=entry["numbers"])
        case "times_table" | "arithmetic":
            view["items"] = [{"id": item["id"], "text": item["text"]} for item in entry["items"]]
    return view
