from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_, select

from app.api.deps import CurrentUser, DbSession
from app.models import Quiz, QuizStatus, Tag, quiz_tags
from app.schemas.quiz import QuizPublicDetail, QuizSummary, TagOut
from app.services.quizzes import QUIZ_LOAD_OPTIONS, quiz_settings, summary_fields

router = APIRouter(prefix="/api", tags=["quizzes"])


def get_visible_quiz(db: DbSession, quiz_id: int, user: CurrentUser) -> Quiz:
    quiz = db.scalar(select(Quiz).where(Quiz.id == quiz_id).options(*QUIZ_LOAD_OPTIONS))
    if quiz is None or (quiz.status != QuizStatus.published and quiz.owner_id != user.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kviz ne obstaja.")
    return quiz


@router.get("/quizzes", response_model=list[QuizSummary])
def list_quizzes(
    db: DbSession,
    _: CurrentUser,
    search: str | None = Query(default=None, max_length=100),
    tag: str | None = None,
    grade: int | None = Query(default=None, ge=1, le=9),
) -> list[QuizSummary]:
    stmt = (
        select(Quiz)
        .where(Quiz.status == QuizStatus.published)
        .options(*QUIZ_LOAD_OPTIONS)
        .order_by(Quiz.updated_at.desc(), Quiz.id.desc())
    )
    if search and search.strip():
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(or_(Quiz.title.ilike(pattern), Quiz.description.ilike(pattern)))
    if tag:
        stmt = stmt.where(Quiz.tags.any(Tag.name == tag.strip().lower()))
    if grade:
        stmt = stmt.where(Quiz.grade == grade)
    return [QuizSummary(**summary_fields(quiz)) for quiz in db.scalars(stmt)]


@router.get("/quizzes/{quiz_id}", response_model=QuizPublicDetail)
def get_quiz(quiz_id: int, db: DbSession, user: CurrentUser) -> QuizPublicDetail:
    quiz = get_visible_quiz(db, quiz_id, user)
    settings = quiz_settings(quiz)
    return QuizPublicDetail(
        **summary_fields(quiz),
        sources=quiz.sources or [],
        max_attempts=settings.max_attempts,
        show_timer=settings.show_timer,
        layout=settings.layout,
        is_owner=quiz.owner_id == user.id,
    )


@router.get("/tags", response_model=list[TagOut])
def list_tags(db: DbSession, _: CurrentUser) -> list[TagOut]:
    quiz_count = func.count(Quiz.id)
    stmt = (
        select(Tag.name, quiz_count)
        .join(quiz_tags, quiz_tags.c.tag_id == Tag.id)
        .join(Quiz, Quiz.id == quiz_tags.c.quiz_id)
        .where(Quiz.status == QuizStatus.published)
        .group_by(Tag.name)
        .order_by(quiz_count.desc(), Tag.name)
    )
    return [TagOut(name=name, quiz_count=count) for name, count in db.execute(stmt)]
