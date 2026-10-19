import hmac
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.api.routes.quizzes import get_visible_quiz
from app.models import Attempt, Quiz
from app.schemas.attempt import AttemptResult, AttemptStart, AttemptSubmit, AttemptView, MyAttempt
from app.services.attempts import (
    TIME_LIMIT_GRACE_SECONDS,
    attempt_result,
    attempt_view,
    aware,
    finished_attempts_count,
    percent,
)
from app.services.generators import build_snapshot
from app.services.grading import grade_attempt
from app.services.quizzes import quiz_settings
from app.services.sanitize import to_student_view

router = APIRouter(prefix="/api", tags=["attempts"])


def _get_attempt(db: DbSession, attempt_id: int) -> Attempt:
    attempt = db.scalar(
        select(Attempt)
        .where(Attempt.id == attempt_id)
        .options(selectinload(Attempt.quiz), selectinload(Attempt.user))
    )
    if attempt is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Poskus ne obstaja.")
    return attempt


@router.post("/quizzes/{quiz_id}/attempts", response_model=AttemptView, status_code=status.HTTP_201_CREATED)
def start_attempt(quiz_id: int, data: AttemptStart, db: DbSession, user: CurrentUser) -> dict[str, Any]:
    quiz = get_visible_quiz(db, quiz_id, user)
    is_owner = quiz.owner_id == user.id
    settings = quiz_settings(quiz)

    if quiz.access_code and not is_owner:
        code = (data.access_code or "").strip().upper()
        if not code:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Kviz je zaklenjen. Vpiši kodo, ki ti jo je dal učitelj.")
        if not hmac.compare_digest(code.encode(), quiz.access_code.encode()):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Koda ni pravilna. Poskusi znova.")

    if settings.max_attempts and not is_owner:
        if finished_attempts_count(db, quiz.id, user.id) >= settings.max_attempts:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Za ta kviz ni več prostih poskusov.")

    if not any(q.type != "info" for q in quiz.questions):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Kviz še nima nalog.")

    snapshot = build_snapshot(
        quiz.questions, shuffle_questions=settings.shuffle_questions, shuffle_options=settings.shuffle_options
    )
    attempt = Attempt(quiz_id=quiz.id, user_id=user.id, started_at=datetime.now(UTC), snapshot=snapshot)
    db.add(attempt)
    db.commit()
    return attempt_view(attempt, quiz, [to_student_view(entry) for entry in snapshot])


@router.post("/attempts/{attempt_id}/submit", response_model=AttemptResult)
def submit_attempt(attempt_id: int, data: AttemptSubmit, db: DbSession, user: CurrentUser) -> dict[str, Any]:
    attempt = _get_attempt(db, attempt_id)
    if attempt.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Poskus ne obstaja.")
    if attempt.finished_at is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ta poskus je že oddan.")

    finished_at = datetime.now(UTC)
    duration = max(0, round((finished_at - aware(attempt.started_at)).total_seconds()))
    limit = quiz_settings(attempt.quiz).time_limit_seconds

    score, max_score, results = grade_attempt(attempt.snapshot, data.answers)
    attempt.finished_at = finished_at
    attempt.duration_seconds = min(duration, limit) if limit else duration
    attempt.timed_out = bool(limit and duration > limit + TIME_LIMIT_GRACE_SECONDS)
    attempt.answers = data.answers
    attempt.score = score
    attempt.max_score = max_score
    attempt.results = results
    db.commit()
    return attempt_result(db, attempt)


@router.get("/attempts/me", response_model=list[MyAttempt])
def my_attempts(db: DbSession, user: CurrentUser) -> list[dict[str, Any]]:
    attempts = db.scalars(
        select(Attempt)
        .where(Attempt.user_id == user.id, Attempt.finished_at.is_not(None))
        .options(selectinload(Attempt.quiz))
        .order_by(Attempt.finished_at.desc())
    )
    items = []
    for attempt in attempts:
        settings = quiz_settings(attempt.quiz)
        items.append(
            {
                "id": attempt.id,
                "quiz_id": attempt.quiz_id,
                "quiz_title": attempt.quiz.title,
                "theme": settings.theme,
                "emoji": settings.emoji,
                "finished_at": aware(attempt.finished_at),  # type: ignore[arg-type]
                "duration_seconds": attempt.duration_seconds or 0,
                "score": attempt.score,
                "max_score": attempt.max_score,
                "percent": percent(attempt.score, attempt.max_score),
            }
        )
    return items


@router.get("/attempts/{attempt_id}", response_model=AttemptResult | AttemptView)
def get_attempt(attempt_id: int, db: DbSession, user: CurrentUser) -> dict[str, Any]:
    """Oddan poskus vrne rezultat, poskus v teku pa naloge (za nadaljevanje po osvežitvi)."""
    attempt = _get_attempt(db, attempt_id)
    quiz: Quiz = attempt.quiz
    is_teacher_owner = quiz.owner_id == user.id and attempt.user_id != user.id
    if attempt.user_id != user.id and not is_teacher_owner:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Poskus ne obstaja.")
    if attempt.finished_at is None:
        if is_teacher_owner:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Poskus še ni oddan.")
        return attempt_view(attempt, quiz, [to_student_view(entry) for entry in attempt.snapshot])
    return attempt_result(db, attempt, for_teacher=is_teacher_owner)
