from datetime import date, datetime

from pydantic import BaseModel


class StatsSummary(BaseModel):
    attempts: int
    students: int
    average_percent: float | None
    average_seconds: float | None
    best_percent: float | None
    fastest_seconds: int | None
    perfect_count: int


class DistributionBucket(BaseModel):
    label: str
    count: int


class QuestionStats(BaseModel):
    question_id: int | None
    position: int
    label: str
    type: str
    answered: int
    success_rate: float | None
    average_percent: float | None


class DayCount(BaseModel):
    day: date
    count: int


class AttemptRow(BaseModel):
    id: int
    student_id: int
    student_name: str
    username: str
    grade: int | None
    score: float
    max_score: float
    percent: float
    duration_seconds: int
    finished_at: datetime
    timed_out: bool
    attempt_number: int


class StudentRow(BaseModel):
    student_id: int
    student_name: str
    grade: int | None
    attempts: int
    best_percent: float
    best_seconds: int | None
    average_seconds: float
    last_finished_at: datetime


class QuizStats(BaseModel):
    quiz_id: int
    title: str
    theme: str
    emoji: str
    status: str
    access_code: str | None
    summary: StatsSummary
    distribution: list[DistributionBucket]
    questions: list[QuestionStats]
    by_day: list[DayCount]
    attempts: list[AttemptRow]
    students: list[StudentRow]
