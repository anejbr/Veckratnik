from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Attempt, Quiz
from app.services.quizzes import quiz_settings

# Koliko sekund po izteku časovne omejitve še sprejmemo oddajo (zamik omrežja)
TIME_LIMIT_GRACE_SECONDS = 15


def aware(value: datetime) -> datetime:
    """SQLite vrne čas brez časovnega pasu – privzamemo UTC."""
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def percent(score: float, max_score: float) -> float:
    return round(100 * score / max_score, 1) if max_score else 100.0


def finished_attempts_count(db: Session, quiz_id: int, user_id: int) -> int:
    return db.scalar(
        select(func.count(Attempt.id)).where(
            Attempt.quiz_id == quiz_id, Attempt.user_id == user_id, Attempt.finished_at.is_not(None)
        )
    ) or 0


def my_quiz_stats(db: Session, user_id: int, quiz_ids: list[int]) -> dict[int, dict[str, Any]]:
    """Število poskusov ter najboljši rezultat in čas prijavljenega uporabnika po kvizih."""
    if not quiz_ids:
        return {}
    rows = db.execute(
        select(Attempt.quiz_id, Attempt.score, Attempt.max_score, Attempt.duration_seconds).where(
            Attempt.user_id == user_id, Attempt.quiz_id.in_(quiz_ids), Attempt.finished_at.is_not(None)
        )
    ).all()
    stats: dict[int, dict[str, Any]] = {}
    for quiz_id, score, max_score, duration in rows:
        entry = stats.setdefault(quiz_id, {"my_attempts": 0, "my_best_percent": None, "my_best_seconds": None})
        entry["my_attempts"] += 1
        value = percent(score, max_score)
        if entry["my_best_percent"] is None or value > entry["my_best_percent"]:
            entry["my_best_percent"] = value
        if duration is not None and (entry["my_best_seconds"] is None or duration < entry["my_best_seconds"]):
            entry["my_best_seconds"] = duration
    return stats


def attempt_view(attempt: Attempt, quiz: Quiz, questions: list[dict[str, Any]]) -> dict[str, Any]:
    settings = quiz_settings(quiz)
    return {
        "id": attempt.id,
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "theme": settings.theme,
        "emoji": settings.emoji,
        "font_size": settings.font_size,
        "layout": settings.layout,
        "show_timer": settings.show_timer,
        "time_limit_seconds": settings.time_limit_seconds,
        "started_at": aware(attempt.started_at),
        "server_time": datetime.now(UTC),
        "questions": questions,
    }


def attempt_result(db: Session, attempt: Attempt, *, for_teacher: bool = False) -> dict[str, Any]:
    quiz = attempt.quiz
    settings = quiz_settings(quiz)
    show_answers = settings.show_correct_answers or for_teacher

    earlier = db.execute(
        select(Attempt.score, Attempt.max_score, Attempt.duration_seconds).where(
            Attempt.quiz_id == quiz.id,
            Attempt.user_id == attempt.user_id,
            Attempt.finished_at.is_not(None),
            Attempt.id < attempt.id,
        )
    ).all()
    previous_best = None
    if earlier:
        best = max(earlier, key=lambda row: (percent(row.score, row.max_score), -(row.duration_seconds or 0)))
        previous_best = {"percent": percent(best.score, best.max_score), "duration_seconds": best.duration_seconds}

    results = attempt.results or []
    if not show_answers:
        results = [
            {**r, "expected": None, "items": [{**i, "expected": None} for i in r.get("items", [])]} for r in results
        ]

    return {
        "id": attempt.id,
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "theme": settings.theme,
        "emoji": settings.emoji,
        "student_name": attempt.user.full_name,
        "started_at": aware(attempt.started_at),
        "finished_at": aware(attempt.finished_at),  # type: ignore[arg-type]
        "duration_seconds": attempt.duration_seconds or 0,
        "score": attempt.score,
        "max_score": attempt.max_score,
        "percent": percent(attempt.score, attempt.max_score),
        "timed_out": attempt.timed_out,
        "attempt_number": len(earlier) + 1,
        "show_correct_answers": show_answers,
        "previous_best": previous_best,
        "results": results,
    }
