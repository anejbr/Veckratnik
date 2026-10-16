from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Question, Quiz, Tag
from app.schemas.questions import GENERATOR_TYPES
from app.schemas.quiz import QuizIn, QuizSettings

QUIZ_LOAD_OPTIONS = (
    selectinload(Quiz.tags),
    selectinload(Quiz.questions),
    selectinload(Quiz.owner),
)


def get_or_create_tags(db: Session, names: list[str]) -> list[Tag]:
    if not names:
        return []
    existing = {tag.name: tag for tag in db.scalars(select(Tag).where(Tag.name.in_(names)))}
    tags = []
    for name in names:
        tag = existing.get(name)
        if tag is None:
            tag = Tag(name=name)
            db.add(tag)
        tags.append(tag)
    return tags


def apply_quiz_input(db: Session, quiz: Quiz, data: QuizIn) -> None:
    quiz.title = data.title
    quiz.description = data.description
    quiz.grade = data.grade
    quiz.status = data.status
    quiz.access_code = data.access_code
    quiz.settings = data.settings.model_dump(mode="json")
    quiz.sources = data.sources
    quiz.tags = get_or_create_tags(db, data.tags)
    quiz.updated_at = func.now()

    existing = {question.id: question for question in quiz.questions}
    questions: list[Question] = []
    for position, item in enumerate(data.questions):
        question = existing.pop(item.id, None) if item.id is not None else None
        if question is None or question.type != item.type:
            question = Question()
        question.position = position
        question.type = item.type
        question.prompt = item.prompt
        question.points = item.points
        question.hint = item.hint
        question.explanation = item.explanation
        question.config = item.config()
        questions.append(question)
    quiz.questions = questions


def question_to_dict(question: Question) -> dict[str, Any]:
    return {
        "id": question.id,
        "type": question.type,
        "prompt": question.prompt,
        "points": question.points,
        "hint": question.hint,
        "explanation": question.explanation,
        **(question.config or {}),
    }


def task_count(quiz: Quiz) -> int:
    """Število nalog, ki jih učenec reši (generator šteje kot več računov)."""
    total = 0
    for question in quiz.questions:
        if question.type == "info":
            continue
        total += int(question.config.get("count", 1)) if question.type in GENERATOR_TYPES else 1
    return total


def quiz_settings(quiz: Quiz) -> QuizSettings:
    return QuizSettings.model_validate(quiz.settings or {})


def summary_fields(quiz: Quiz) -> dict[str, Any]:
    settings = quiz_settings(quiz)
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "grade": quiz.grade,
        "status": quiz.status,
        "tags": [tag.name for tag in quiz.tags],
        "theme": settings.theme,
        "emoji": settings.emoji,
        "locked": quiz.access_code is not None,
        "question_count": task_count(quiz),
        "time_limit_seconds": settings.time_limit_seconds,
        "owner_name": quiz.owner.full_name,
        "created_at": quiz.created_at,
        "updated_at": quiz.updated_at,
    }


def teacher_detail(quiz: Quiz) -> dict[str, Any]:
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "grade": quiz.grade,
        "status": quiz.status,
        "access_code": quiz.access_code,
        "settings": quiz_settings(quiz),
        "tags": [tag.name for tag in quiz.tags],
        "sources": quiz.sources or [],
        "questions": [question_to_dict(question) for question in quiz.questions],
        "created_at": quiz.created_at,
        "updated_at": quiz.updated_at,
    }
