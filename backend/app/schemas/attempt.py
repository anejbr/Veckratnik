from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AttemptStart(BaseModel):
    access_code: str | None = Field(default=None, max_length=20)


class AttemptSubmit(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)


class AttemptView(BaseModel):
    """Poskus v teku – naloge brez rešitev."""

    id: int
    quiz_id: int
    quiz_title: str
    theme: str
    emoji: str
    font_size: str
    layout: str
    show_timer: bool
    time_limit_seconds: int | None
    started_at: datetime
    server_time: datetime
    questions: list[dict[str, Any]]


class PreviousBest(BaseModel):
    percent: float
    duration_seconds: int | None


class AttemptResult(BaseModel):
    id: int
    quiz_id: int
    quiz_title: str
    theme: str
    emoji: str
    student_name: str
    started_at: datetime
    finished_at: datetime
    duration_seconds: int
    score: float
    max_score: float
    percent: float
    timed_out: bool
    attempt_number: int
    show_correct_answers: bool
    previous_best: PreviousBest | None
    results: list[dict[str, Any]]


class MyAttempt(BaseModel):
    id: int
    quiz_id: int
    quiz_title: str
    theme: str
    emoji: str
    finished_at: datetime
    duration_seconds: int
    score: float
    max_score: float
    percent: float
