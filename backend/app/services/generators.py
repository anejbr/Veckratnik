"""Priprava nalog za posamezen poskus.

Ob začetku reševanja vsako nalogo pretvorimo v »vnos posnetka« (snapshot):
generatorji dobijo konkretne račune, možnosti se premešajo. Posnetek vsebuje
tudi rešitve in ostane shranjen pri poskusu, zato ocenjevanje ni odvisno od
kasnejših sprememb kviza.
"""

import random
from typing import Any

from app.models import Question
from app.services.expr import evaluate


def _shuffled_different(values: list[Any], rng: random.Random) -> list[Any]:
    """Premeša seznam tako, da ni v izvirnem vrstnem redu (če je to mogoče)."""
    if len(values) < 2 or len(set(map(str, values))) < 2:
        return list(values)
    shuffled = list(values)
    while shuffled == values:
        rng.shuffle(shuffled)
    return shuffled


def _sign(left: str, right: str) -> str:
    a, b = evaluate(left), evaluate(right)
    return "=" if a == b else "<" if a < b else ">"


def generate_times_table(config: dict[str, Any], entry_id: str, rng: random.Random) -> list[dict[str, Any]]:
    operation = config.get("operation", "multiply")
    operations = ["multiply", "divide"] if operation == "mixed" else [operation]
    pool = [
        (factor, multiplier, op)
        for factor in config["factors"]
        for multiplier in range(1, int(config.get("max_multiplier", 10)) + 1)
        for op in operations
    ]
    count = int(config.get("count", 10))
    chosen: list[tuple[int, int, str]] = []
    while len(chosen) < count:
        batch = list(pool)
        rng.shuffle(batch)
        chosen.extend(batch[: count - len(chosen)])

    items = []
    for i, (factor, multiplier, op) in enumerate(chosen):
        if op == "multiply":
            a, b = (multiplier, factor) if rng.random() < 0.5 else (factor, multiplier)
            text, answer = f"{a} · {b}", factor * multiplier
        else:
            text, answer = f"{factor * multiplier} : {factor}", multiplier
        items.append({"id": f"{entry_id}-{i + 1}", "text": text, "answer": answer})
    return items


def _arithmetic_item(config: dict[str, Any], rng: random.Random) -> tuple[str, int]:
    low, high = int(config.get("min_value", 0)), int(config.get("max_value", 20))
    op = rng.choice(config["operations"])
    a, b = rng.randint(low, high), rng.randint(low, high)
    if op == "+":
        return f"{a} + {b}", a + b
    if op == "-":
        if not config.get("allow_negative") and b > a:
            a, b = b, a
        return f"{a} − {b}", a - b
    if op == "*":
        return f"{a} · {b}", a * b
    divisor = rng.randint(max(1, low), max(1, high))
    quotient = rng.randint(max(0, low), high)
    return f"{divisor * quotient} : {divisor}", quotient


def generate_arithmetic(config: dict[str, Any], entry_id: str, rng: random.Random) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    seen: set[str] = set()
    for i in range(int(config.get("count", 10))):
        for _ in range(20):  # poskusi se izogniti ponavljanju istega računa
            text, answer = _arithmetic_item(config, rng)
            if text not in seen:
                break
        seen.add(text)
        items.append({"id": f"{entry_id}-{i + 1}", "text": text, "answer": answer})
    return items


def build_entry(question: Question, rng: random.Random, shuffle_options: bool = True) -> dict[str, Any]:
    config = dict(question.config or {})
    entry_id = f"q{question.id}"
    entry: dict[str, Any] = {
        "id": entry_id,
        "question_id": question.id,
        "type": question.type,
        "prompt": question.prompt,
        "points": question.points,
        "hint": question.hint,
        "explanation": question.explanation,
        "image_url": config.get("image_url"),
    }

    match question.type:
        case "single_choice" | "multiple_choice":
            options = list(config["options"])
            if shuffle_options:
                rng.shuffle(options)
            entry.update(options=options, correct=config["correct"])
        case "true_false":
            entry["correct"] = config["correct"]
        case "numeric":
            entry.update(answer=config["answer"], tolerance=config.get("tolerance", 0), unit=config.get("unit"))
        case "short_text":
            entry.update(accepted=config["accepted"], case_sensitive=config.get("case_sensitive", False))
        case "fill_blank":
            entry.update(template=config["template"], answers=config["answers"])
        case "compare":
            entry.update(left=config["left"], right=config["right"], correct_sign=_sign(config["left"], config["right"]))
        case "ordering":
            items = [{"id": f"o{i}", "text": text} for i, text in enumerate(config["items"])]
            presented = _shuffled_different([item["id"] for item in items], rng)
            entry.update(items=items, presented=presented, direction_label=config.get("direction_label", ""))
        case "matching":
            pairs = config["pairs"]
            left = [{"id": f"l{i}", "text": pair["left"]} for i, pair in enumerate(pairs)]
            right = [{"id": f"r{i}", "text": pair["right"]} for i, pair in enumerate(pairs)]
            entry.update(left=left, right=_shuffled_different(right, rng), solution={f"l{i}": f"r{i}" for i in range(len(pairs))})
        case "multiples_grid":
            number = int(config["number"])
            numbers = list(range(int(config["range_from"]), int(config["range_to"]) + 1))
            if config.get("mode") == "divisors":
                correct = [n for n in numbers if number % n == 0]
            else:
                correct = [n for n in numbers if n % number == 0]
            entry.update(mode=config.get("mode", "multiples"), number=number, numbers=numbers, correct_numbers=correct)
        case "times_table":
            entry["items"] = generate_times_table(config, entry_id, rng)
        case "arithmetic":
            entry["items"] = generate_arithmetic(config, entry_id, rng)
    return entry


def build_snapshot(
    questions: list[Question], *, shuffle_questions: bool, shuffle_options: bool, rng: random.Random | None = None
) -> list[dict[str, Any]]:
    rng = rng or random.Random()
    ordered = list(questions)
    if shuffle_questions:
        rng.shuffle(ordered)
    return [build_entry(question, rng, shuffle_options) for question in ordered]
