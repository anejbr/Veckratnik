"""Ocenjevanje odgovorov. Vsaka vrsta naloge ima svojo čisto funkcijo."""

from fractions import Fraction
from typing import Any

from app.services.expr import format_number, parse_number

SIGN_LABELS = {"<": "<", "=": "=", ">": ">"}


def _text(value: Any) -> str:
    return "" if value is None else str(value).strip()


def _same_text(given: str, expected: str, case_sensitive: bool = False) -> bool:
    """Primerja besedilo; če sta oba števili, ju primerja številsko (3,5 = 3.5)."""
    a, b = " ".join(given.split()), " ".join(expected.split())
    num_a, num_b = parse_number(a), parse_number(b)
    if num_a is not None and num_b is not None:
        return num_a == num_b
    return a == b if case_sensitive else a.casefold() == b.casefold()


def _fill(template: str, values: list[str]) -> str:
    parts = template.split("{}")
    filled = parts[0]
    for value, part in zip(values, parts[1:]):
        filled += (value or "___") + part
    return filled


def _result(
    entry: dict[str, Any], earned: float, maximum: float, given: str, expected: str, **extra: Any
) -> dict[str, Any]:
    earned = round(max(0.0, min(earned, maximum)), 2)
    return {
        "id": entry["id"],
        "question_id": entry.get("question_id"),
        "type": entry["type"],
        "prompt": entry.get("prompt", ""),
        "explanation": entry.get("explanation"),
        "earned": earned,
        "max": float(maximum),
        "correct": earned >= maximum,
        "given": given,
        "expected": expected,
        **extra,
    }


def grade_entry(entry: dict[str, Any], answer: Any) -> dict[str, Any] | None:
    """Vrne rezultat naloge ali None za bloke brez točk (info)."""
    points = float(entry.get("points", 0))
    kind = entry["type"]

    if kind == "info":
        return None

    if kind in ("single_choice", "multiple_choice"):
        texts = {option["id"]: option["text"] for option in entry["options"]}
        if kind == "single_choice":
            given = texts.get(answer, "") if isinstance(answer, str) else ""
            ok = answer == entry["correct"]
            return _result(entry, points if ok else 0, points, given, texts[entry["correct"]])
        chosen = {a for a in answer if a in texts} if isinstance(answer, list) else set()
        correct = set(entry["correct"])
        hits, misses = len(chosen & correct), len(chosen - correct)
        earned = points * max(0, hits - misses) / len(correct)
        order = [option["id"] for option in entry["options"]]
        join = lambda ids: ", ".join(texts[i] for i in order if i in ids)  # noqa: E731
        return _result(entry, earned, points, join(chosen), join(correct))

    if kind == "true_false":
        label = {True: "drži", False: "ne drži"}
        ok = isinstance(answer, bool) and answer == entry["correct"]
        given = label[answer] if isinstance(answer, bool) else ""
        return _result(entry, points if ok else 0, points, given, label[entry["correct"]])

    if kind == "numeric":
        given = parse_number(_text(answer))
        expected = Fraction(str(entry["answer"]))
        ok = given is not None and abs(given - expected) <= Fraction(str(entry.get("tolerance", 0)))
        unit = f" {entry['unit']}" if entry.get("unit") else ""
        return _result(entry, points if ok else 0, points, _text(answer), f"{format_number(expected)}{unit}")

    if kind == "short_text":
        given = _text(answer)
        ok = bool(given) and any(_same_text(given, a, entry.get("case_sensitive", False)) for a in entry["accepted"])
        return _result(entry, points if ok else 0, points, given, entry["accepted"][0])

    if kind == "fill_blank":
        expected = entry["answers"]
        given = [_text(a) for a in answer] if isinstance(answer, list) else []
        given += [""] * (len(expected) - len(given))
        hits = sum(1 for g, e in zip(given, expected) if g and _same_text(g, e))
        return _result(
            entry, points * hits / len(expected), points, _fill(entry["template"], given), _fill(entry["template"], expected)
        )

    if kind == "compare":
        ok = answer == entry["correct_sign"]
        sign = answer if answer in SIGN_LABELS else "?"
        return _result(
            entry,
            points if ok else 0,
            points,
            f"{entry['left']} {sign} {entry['right']}",
            f"{entry['left']} {entry['correct_sign']} {entry['right']}",
        )

    if kind == "ordering":
        texts = {item["id"]: item["text"] for item in entry["items"]}
        correct_order = [item["id"] for item in entry["items"]]
        given = answer if isinstance(answer, list) and sorted(answer) == sorted(correct_order) else entry["presented"]
        hits = sum(1 for g, c in zip(given, correct_order) if texts[g] == texts[c])
        earned = points if hits == len(correct_order) else points * hits / len(correct_order) / 2
        given_text = ", ".join(texts[i] for i in given)
        return _result(entry, earned, points, given_text, ", ".join(texts[i] for i in correct_order))

    if kind == "matching":
        right = {item["id"]: item["text"] for item in entry["right"]}
        chosen = answer if isinstance(answer, dict) else {}
        items = []
        for left in entry["left"]:
            given_text = right.get(chosen.get(left["id"], ""), "")
            expected_text = right[entry["solution"][left["id"]]]
            items.append(
                {"text": left["text"], "given": given_text, "expected": expected_text, "correct": given_text == expected_text}
            )
        hits = sum(1 for item in items if item["correct"])
        summary = lambda key: "; ".join(f"{i['text']} → {i[key] or '–'}" for i in items)  # noqa: E731
        return _result(entry, points * hits / len(items), points, summary("given"), summary("expected"), items=items)

    if kind == "multiples_grid":
        chosen = {int(n) for n in answer if isinstance(n, (int, float))} if isinstance(answer, list) else set()
        correct = set(entry["correct_numbers"])
        hits, misses = len(chosen & correct), len(chosen - correct)
        earned = points * max(0, hits - misses) / len(correct) if correct else (points if not chosen else 0)
        fmt = lambda values: ", ".join(str(n) for n in sorted(values)) or "–"  # noqa: E731
        return _result(entry, earned, points, fmt(chosen), fmt(correct))

    if kind in ("times_table", "arithmetic"):
        given_map = answer if isinstance(answer, dict) else {}
        items = []
        for item in entry["items"]:
            raw = _text(given_map.get(item["id"]))
            value = parse_number(raw)
            items.append(
                {"text": item["text"], "given": raw, "expected": str(item["answer"]), "correct": value == item["answer"]}
            )
        hits = sum(1 for item in items if item["correct"])
        total = points * len(items)
        summary = f"{hits}/{len(items)} pravilnih"
        return _result(entry, points * hits, total, summary, f"{len(items)}/{len(items)}", items=items)

    raise ValueError(f"Neznana vrsta naloge: {kind}")


def grade_attempt(snapshot: list[dict[str, Any]], answers: dict[str, Any]) -> tuple[float, float, list[dict[str, Any]]]:
    results = [r for entry in snapshot if (r := grade_entry(entry, answers.get(entry["id"]))) is not None]
    score = round(sum(r["earned"] for r in results), 2)
    max_score = round(sum(r["max"] for r in results), 2)
    return score, max_score, results
