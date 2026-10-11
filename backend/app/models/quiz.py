import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, JSONType

if TYPE_CHECKING:
    from app.models.attempt import Attempt
    from app.models.user import User


class QuizStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


quiz_tags = Table(
    "quiz_tags",
    Base.metadata,
    Column("quiz_id", ForeignKey("quizzes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40), unique=True, index=True)


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(Text, default="")
    grade: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[QuizStatus] = mapped_column(
        Enum(QuizStatus, name="quiz_status"), default=QuizStatus.draft, index=True
    )
    # Če je koda nastavljena, je kviz zaklenjen
    access_code: Mapped[str | None] = mapped_column(String(20))
    settings: Mapped[dict[str, Any]] = mapped_column(JSONType, default=dict)
    sources: Mapped[list[str]] = mapped_column(JSONType, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="quizzes")
    tags: Mapped[list[Tag]] = relationship(secondary=quiz_tags, order_by=Tag.name)
    questions: Mapped[list["Question"]] = relationship(
        back_populates="quiz", cascade="all, delete-orphan", order_by="Question.position"
    )
    attempts: Mapped[list["Attempt"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    type: Mapped[str] = mapped_column(String(30))
    prompt: Mapped[str] = mapped_column(Text, default="")
    points: Mapped[int] = mapped_column(Integer, default=1)
    hint: Mapped[str | None] = mapped_column(Text)
    explanation: Mapped[str | None] = mapped_column(Text)
    # Nastavitve, specifične za tip naloge (vključno s pravilnimi odgovori)
    config: Mapped[dict[str, Any]] = mapped_column(JSONType, default=dict)

    quiz: Mapped[Quiz] = relationship(back_populates="questions")
