from datetime import datetime
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models import QuizStatus
from app.schemas.questions import QuestionIn

THEMES = ("indigo", "sky", "emerald", "amber", "rose", "violet", "orange", "teal")


class QuizSettings(BaseModel):
    """Videz kviza in pravila reševanja."""

    theme: Literal[THEMES] = "indigo"  # type: ignore[valid-type]
    emoji: str = Field(default="🧮", max_length=8)
    font_size: Literal["normal", "large"] = "normal"
    layout: Literal["one_by_one", "all_at_once"] = "one_by_one"
    show_timer: bool = True
    time_limit_seconds: int | None = Field(default=None, ge=10, le=7200)
    shuffle_questions: bool = False
    shuffle_options: bool = True
    show_correct_answers: bool = True
    max_attempts: int | None = Field(default=None, ge=1, le=100)


class QuizIn(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(default="", max_length=2000)
    grade: int | None = Field(default=None, ge=1, le=9)
    status: QuizStatus = QuizStatus.draft
    access_code: str | None = Field(default=None, max_length=20)
    settings: QuizSettings = Field(default_factory=QuizSettings)
    tags: list[str] = Field(default_factory=list, max_length=10)
    sources: list[Annotated[str, Field(max_length=500)]] = Field(default_factory=list, max_length=20)
    questions: list[QuestionIn] = Field(default_factory=list, max_length=100)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        return value.strip()

    @field_validator("access_code")
    @classmethod
    def normalize_code(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        code = value.strip().upper()
        if len(code) < 4 or not all(ch.isalnum() or ch == "-" for ch in code):
            raise ValueError("Koda naj ima vsaj 4 znake (črke, številke ali -).")
        return code

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: list[str]) -> list[str]:
        tags: list[str] = []
        for tag in value:
            name = " ".join(tag.strip().lower().lstrip("#").split())[:40]
            if name and name not in tags:
                tags.append(name)
        return tags

    @field_validator("sources")
    @classmethod
    def drop_empty_sources(cls, value: list[str]) -> list[str]:
        return [source.strip() for source in value if source.strip()]

    @model_validator(mode="after")
    def published_needs_questions(self) -> "QuizIn":
        if self.status == QuizStatus.published and not any(q.type != "info" for q in self.questions):
            raise ValueError("Objavljen kviz mora imeti vsaj eno nalogo.")
        return self


class QuizSummary(BaseModel):
    """Kviz v seznamu (brez nalog)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    grade: int | None
    status: QuizStatus
    tags: list[str]
    theme: str
    emoji: str
    locked: bool
    question_count: int
    time_limit_seconds: int | None
    owner_name: str
    created_at: datetime
    updated_at: datetime
    # rezultati prijavljenega uporabnika
    my_attempts: int = 0
    my_best_percent: float | None = None
    my_best_seconds: int | None = None


class QuizPublicDetail(QuizSummary):
    sources: list[str]
    max_attempts: int | None
    show_timer: bool
    layout: str
    is_owner: bool


class TeacherQuizSummary(QuizSummary):
    access_code: str | None
    attempt_count: int


class TeacherQuizDetail(BaseModel):
    """Celoten kviz z nalogami in rešitvami – samo za lastnika."""

    id: int
    title: str
    description: str
    grade: int | None
    status: QuizStatus
    access_code: str | None
    settings: QuizSettings
    tags: list[str]
    sources: list[str]
    questions: list[dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class TagOut(BaseModel):
    name: str
    quiz_count: int
