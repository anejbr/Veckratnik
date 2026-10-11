from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, JSONType

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.user import User


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    score: Mapped[float] = mapped_column(Float, default=0)
    max_score: Mapped[float] = mapped_column(Float, default=0)
    timed_out: Mapped[bool] = mapped_column(Boolean, default=False)
    # Naloge, kot jih je učenec dobil (generatorji so že razširjeni)
    snapshot: Mapped[list[dict[str, Any]]] = mapped_column(JSONType, default=list)
    answers: Mapped[dict[str, Any] | None] = mapped_column(JSONType)
    results: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONType)

    quiz: Mapped["Quiz"] = relationship(back_populates="attempts")
    user: Mapped["User"] = relationship(back_populates="attempts")
