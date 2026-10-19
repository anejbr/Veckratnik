import random
from types import SimpleNamespace

import pytest

from app.services.generators import build_entry, generate_arithmetic, generate_times_table
from app.services.grading import grade_attempt, grade_entry
from app.services.sanitize import to_student_view


def entry_for(qtype: str, points: int = 1, **config) -> dict:
    question = SimpleNamespace(id=1, type=qtype, prompt="", points=points, hint=None, explanation=None, config=config)
    return build_entry(question, random.Random(7))  # type: ignore[arg-type]


OPTIONS = [{"id": "a", "text": "42"}, {"id": "b", "text": "36"}, {"id": "c", "text": "48"}]


@pytest.mark.parametrize(
    ("qtype", "config", "answer", "earned"),
    [
        ("single_choice", {"options": OPTIONS, "correct": "a"}, "a", 2),
        ("single_choice", {"options": OPTIONS, "correct": "a"}, "b", 0),
        ("multiple_choice", {"options": OPTIONS, "correct": ["a", "c"]}, ["a", "c"], 2),
        ("multiple_choice", {"options": OPTIONS, "correct": ["a", "c"]}, ["a"], 1),
        ("multiple_choice", {"options": OPTIONS, "correct": ["a", "c"]}, ["a", "b"], 0),
        ("true_false", {"correct": False}, False, 2),
        ("true_false", {"correct": False}, "false", 0),
        ("numeric", {"answer": 3.5, "tolerance": 0}, "3,5", 2),
        ("numeric", {"answer": 24, "tolerance": 1}, "25", 2),
        ("numeric", {"answer": 24, "tolerance": 0}, "abc", 0),
        ("short_text", {"accepted": ["zmnožek", "produkt"], "case_sensitive": False}, "  Produkt ", 2),
        ("short_text", {"accepted": ["zmnožek"], "case_sensitive": True}, "Zmnožek", 0),
        ("fill_blank", {"template": "{} · {} = 56", "answers": ["7", "8"]}, ["7", "8"], 2),
        ("fill_blank", {"template": "{} · {} = 56", "answers": ["7", "8"]}, ["7", "9"], 1),
        ("compare", {"left": "3 · 8", "right": "4 · 6"}, "=", 2),
        ("compare", {"left": "3 · 8", "right": "25"}, ">", 0),
        ("multiples_grid", {"mode": "multiples", "number": 5, "range_from": 1, "range_to": 20}, [5, 10, 15, 20], 2),
        ("multiples_grid", {"mode": "multiples", "number": 5, "range_from": 1, "range_to": 20}, [5, 10, 12], 0.5),
        ("multiples_grid", {"mode": "divisors", "number": 12, "range_from": 1, "range_to": 12}, [1, 2, 3, 4, 6, 12], 2),
    ],
)
def test_grade_simple_types(qtype: str, config: dict, answer: object, earned: float) -> None:
    result = grade_entry(entry_for(qtype, points=2, **config), answer)
    assert result is not None
    assert result["earned"] == earned
    assert result["correct"] is (earned == 2)


def test_ordering_and_matching() -> None:
    ordering = entry_for("ordering", points=2, items=["6", "12", "18"], direction_label="")
    assert ordering["presented"] != ["o0", "o1", "o2"]
    assert grade_entry(ordering, ["o0", "o1", "o2"])["earned"] == 2
    assert grade_entry(ordering, None)["correct"] is False

    pairs = [{"left": "2 · 5", "right": "10"}, {"left": "3 · 3", "right": "9"}]
    matching = entry_for("matching", points=2, pairs=pairs)
    assert grade_entry(matching, {"l0": "r0", "l1": "r1"})["earned"] == 2
    half = grade_entry(matching, {"l0": "r0", "l1": "r0"})
    assert half["earned"] == 1
    assert half["items"][1] == {"text": "3 · 3", "given": "10", "expected": "9", "correct": False}


def test_times_table_generator() -> None:
    rng = random.Random(1)
    items = generate_times_table({"factors": [3], "max_multiplier": 10, "operation": "mixed", "count": 20}, "q1", rng)
    assert len(items) == 20
    for item in items:
        a, op, b = item["text"].split()
        a, b = int(a), int(b)
        assert item["answer"] == (a * b if op == "·" else a // b)
        if op == ":":
            assert a % b == 0 and b == 3
    # 20 računov iz 20 možnih kombinacij – brez ponavljanja
    assert len({item["text"] for item in items}) == 20


def test_arithmetic_generator_has_no_negative_results() -> None:
    config = {"operations": ["-", ":"], "min_value": 0, "max_value": 20, "count": 30, "allow_negative": False}
    for item in generate_arithmetic(config, "q1", random.Random(3)):
        assert item["answer"] >= 0
        assert float(item["answer"]).is_integer()


def test_generator_grading_per_item() -> None:
    entry = entry_for("times_table", points=1, factors=[2], max_multiplier=10, operation="multiply", count=4)
    answers = {item["id"]: str(item["answer"]) for item in entry["items"][:3]}
    result = grade_entry(entry, answers)
    assert (result["earned"], result["max"]) == (3, 4)


def test_student_view_has_no_solutions() -> None:
    cases = [
        entry_for("single_choice", options=OPTIONS, correct="a"),
        entry_for("numeric", answer=12, tolerance=0, unit="cm"),
        entry_for("short_text", accepted=["zmnožek"]),
        entry_for("fill_blank", template="7 · {} = 56", answers=["8"]),
        entry_for("compare", left="2", right="3"),
        entry_for("matching", pairs=[{"left": "a", "right": "b"}, {"left": "c", "right": "d"}]),
        entry_for("multiples_grid", mode="multiples", number=3, range_from=1, range_to=30),
        entry_for("times_table", factors=[7], max_multiplier=10, operation="multiply", count=5),
    ]
    forbidden = {"correct", "answer", "answers", "accepted", "correct_sign", "solution", "correct_numbers", "explanation"}
    for entry in cases:
        view = to_student_view(entry)
        assert not forbidden & view.keys(), entry["type"]
        for item in view.get("items", []):
            assert "answer" not in item


def test_grade_attempt_skips_info_blocks() -> None:
    info = entry_for("info", points=0)
    tf = entry_for("true_false", points=3, correct=True)
    tf["id"] = "q2"
    score, max_score, results = grade_attempt([info, tf], {"q2": True})
    assert (score, max_score, len(results)) == (3, 3, 1)
