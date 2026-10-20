"""Statistika kviza za učitelja (šteje le oddane poskuse učencev)."""

from collections import Counter, defaultdict
from statistics import mean
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Attempt, Quiz, User, UserRole
from app.services.attempts import aware, percent
from app.services.quizzes import quiz_settings

BUCKETS = [(0, 20, "0–19 %"), (20, 40, "20–39 %"), (40, 60, "40–59 %"), (60, 80, "60–79 %"), (80, 101, "80–100 %")]

TYPE_LABELS = {
    "single_choice": "Izbira odgovora",
    "multiple_choice": "Več pravilnih",
    "true_false": "Drži / ne drži",
    "numeric": "Številski odgovor",
    "short_text": "Kratek odgovor",
    "fill_blank": "Dopolni manjkajoče",
    "compare": "Primerjava",
    "ordering": "Razvrščanje",
    "matching": "Povezovanje",
    "multiples_grid": "Mreža večkratnikov",
    "times_table": "Poštevanka",
    "arithmetic": "Računi",
}


def finished_student_attempts(db: Session, quiz_id: int) -> list[Attempt]:
    return list(
        db.scalars(
            select(Attempt)
            .join(User, User.id == Attempt.user_id)
            .where(
                Attempt.quiz_id == quiz_id,
                Attempt.finished_at.is_not(None),
                User.role == UserRole.student,
            )
            .options(selectinload(Attempt.user))
            .order_by(Attempt.finished_at.desc(), Attempt.id.desc())
        )
    )


def _attempt_rows(attempts: list[Attempt]) -> list[dict[str, Any]]:
    # zaporedna številka poskusa vsakega učenca (najstarejši = 1)
    numbers: dict[int, int] = {}
    counter: Counter[int] = Counter()
    for attempt in sorted(attempts, key=lambda a: a.id):
        counter[attempt.user_id] += 1
        numbers[attempt.id] = counter[attempt.user_id]
    return [
        {
            "id": a.id,
            "student_id": a.user_id,
            "student_name": a.user.full_name,
            "username": a.user.username,
            "grade": a.user.grade,
            "score": a.score,
            "max_score": a.max_score,
            "percent": percent(a.score, a.max_score),
            "duration_seconds": a.duration_seconds or 0,
            "finished_at": aware(a.finished_at),  # type: ignore[arg-type]
            "timed_out": a.timed_out,
            "attempt_number": numbers[a.id],
        }
        for a in attempts
    ]


def _students(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[row["student_id"]].append(row)
    students = []
    for student_id, items in grouped.items():
        best = max(items, key=lambda r: (r["percent"], -r["duration_seconds"]))
        students.append(
            {
                "student_id": student_id,
                "student_name": items[0]["student_name"],
                "grade": items[0]["grade"],
                "attempts": len(items),
                "best_percent": best["percent"],
                "best_seconds": min(r["duration_seconds"] for r in items if r["percent"] == best["percent"]),
                "average_seconds": round(mean(r["duration_seconds"] for r in items), 1),
                "last_finished_at": max(r["finished_at"] for r in items),
            }
        )
    return sorted(students, key=lambda s: s["student_name"].casefold())


def _question_stats(quiz: Quiz, attempts: list[Attempt]) -> list[dict[str, Any]]:
    per_question: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for attempt in attempts:
        for result in attempt.results or []:
            if result.get("question_id") is not None:
                per_question[result["question_id"]].append(result)

    stats = []
    position = 0
    for question in quiz.questions:
        if question.type == "info":
            continue
        position += 1
        results = per_question.get(question.id, [])
        label = question.prompt.strip().splitlines()[0][:80] if question.prompt.strip() else TYPE_LABELS[question.type]
        stats.append(
            {
                "question_id": question.id,
                "position": position,
                "label": label,
                "type": question.type,
                "answered": len(results),
                "success_rate": round(100 * sum(r["correct"] for r in results) / len(results), 1) if results else None,
                "average_percent": round(mean(100 * r["earned"] / r["max"] if r["max"] else 100 for r in results), 1)
                if results
                else None,
            }
        )
    return stats


def quiz_stats(db: Session, quiz: Quiz) -> dict[str, Any]:
    attempts = finished_student_attempts(db, quiz.id)
    rows = _attempt_rows(attempts)
    percents = [r["percent"] for r in rows]
    durations = [r["duration_seconds"] for r in rows]

    distribution = [{"label": label, "count": 0} for _, _, label in BUCKETS]
    for value in percents:
        index = next(i for i, (low, high, _) in enumerate(BUCKETS) if low <= value < high)
        distribution[index]["count"] += 1

    by_day = Counter(r["finished_at"].date() for r in rows)
    settings = quiz_settings(quiz)

    return {
        "quiz_id": quiz.id,
        "title": quiz.title,
        "theme": settings.theme,
        "emoji": settings.emoji,
        "status": quiz.status.value,
        "access_code": quiz.access_code,
        "summary": {
            "attempts": len(rows),
            "students": len({r["student_id"] for r in rows}),
            "average_percent": round(mean(percents), 1) if percents else None,
            "average_seconds": round(mean(durations), 1) if durations else None,
            "best_percent": max(percents) if percents else None,
            "fastest_seconds": min(durations) if durations else None,
            "perfect_count": sum(1 for p in percents if p == 100),
        },
        "distribution": distribution,
        "questions": _question_stats(quiz, attempts),
        "by_day": [{"day": day, "count": count} for day, count in sorted(by_day.items())],
        "attempts": rows,
        "students": _students(rows),
    }
