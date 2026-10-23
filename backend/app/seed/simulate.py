"""Simulirani poskusi demo učencev, da ima učitelj takoj kaj videti v statistiki."""

import random
from datetime import UTC, datetime, timedelta
from typing import Any

from app.models import Attempt, Quiz, User
from app.services.generators import build_snapshot
from app.services.grading import grade_attempt
from app.services.quizzes import quiz_settings, task_count


def _answer(entry: dict[str, Any], skill: float, rng: random.Random) -> Any:
    ok = rng.random() < skill
    match entry["type"]:
        case "single_choice":
            wrong = [o["id"] for o in entry["options"] if o["id"] != entry["correct"]]
            return entry["correct"] if ok else rng.choice(wrong)
        case "multiple_choice":
            return entry["correct"] if ok else entry["correct"][:1]
        case "true_false":
            return entry["correct"] if ok else not entry["correct"]
        case "numeric":
            return str(entry["answer"] if ok else entry["answer"] + rng.choice([-2, -1, 1, 10]))
        case "short_text":
            return entry["accepted"][0] if ok else "ne vem"
        case "fill_blank":
            return entry["answers"] if ok else ["0"] * len(entry["answers"])
        case "compare":
            return entry["correct_sign"] if ok else rng.choice([s for s in "<=>" if s != entry["correct_sign"]])
        case "ordering":
            return [item["id"] for item in entry["items"]] if ok else entry["presented"]
        case "matching":
            return entry["solution"] if ok else {}
        case "multiples_grid":
            correct = entry["correct_numbers"]
            return correct if ok else correct[: max(1, len(correct) // 2)]
        case "times_table" | "arithmetic":
            return {
                item["id"]: str(item["answer"] if rng.random() < skill else item["answer"] + 1) for item in entry["items"]
            }
    return None


def simulate_attempts(db: Any, quizzes: list[Quiz], students: list[User], seed: int = 2026) -> int:
    rng = random.Random(seed)
    now = datetime.now(UTC)
    created = 0
    for student in students:
        base_skill = rng.uniform(0.55, 0.95)
        for quiz in quizzes:
            if quiz.access_code or rng.random() < 0.3:
                continue
            settings = quiz_settings(quiz)
            tasks = task_count(quiz)
            started = now - timedelta(days=rng.randint(1, 9), hours=rng.randint(0, 5), minutes=rng.randint(0, 59))
            for attempt_no in range(rng.choice([1, 1, 2, 3])):
                skill = min(0.99, base_skill + 0.08 * attempt_no)
                snapshot = build_snapshot(
                    quiz.questions,
                    shuffle_questions=settings.shuffle_questions,
                    shuffle_options=settings.shuffle_options,
                    rng=rng,
                )
                answers = {e["id"]: a for e in snapshot if (a := _answer(e, skill, rng)) is not None}
                score, max_score, results = grade_attempt(snapshot, answers)
                seconds = int(tasks * rng.uniform(4, 11) * (1.4 - skill * 0.5))
                if settings.time_limit_seconds:
                    seconds = min(seconds, settings.time_limit_seconds)
                db.add(
                    Attempt(
                        quiz_id=quiz.id,
                        user_id=student.id,
                        started_at=started,
                        finished_at=started + timedelta(seconds=seconds),
                        duration_seconds=seconds,
                        score=score,
                        max_score=max_score,
                        timed_out=False,
                        snapshot=snapshot,
                        answers=answers,
                        results=results,
                    )
                )
                created += 1
                started += timedelta(minutes=rng.randint(10, 60 * 24))
    return created
