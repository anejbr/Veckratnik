from typing import Any

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import func, select

from app.api.deps import DbSession, TeacherUser
from app.models import Attempt, Question, Quiz, QuizStatus, User, UserRole
from app.schemas.quiz import QuizIn, TeacherQuizDetail, TeacherQuizSummary
from app.schemas.stats import QuizStats
from app.services.quizzes import QUIZ_LOAD_OPTIONS, apply_quiz_input, summary_fields, teacher_detail
from app.services.stats import quiz_stats

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


def get_own_quiz(db: DbSession, quiz_id: int, teacher: TeacherUser) -> Quiz:
    quiz = db.scalar(select(Quiz).where(Quiz.id == quiz_id).options(*QUIZ_LOAD_OPTIONS))
    if quiz is None or quiz.owner_id != teacher.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kviz ne obstaja.")
    return quiz


def _reload(db: DbSession, quiz_id: int) -> Quiz:
    db.expire_all()
    return db.scalars(select(Quiz).where(Quiz.id == quiz_id).options(*QUIZ_LOAD_OPTIONS)).one()


@router.get("/quizzes", response_model=list[TeacherQuizSummary])
def list_my_quizzes(db: DbSession, teacher: TeacherUser) -> list[TeacherQuizSummary]:
    attempt_counts: dict[int, int] = dict(
        db.execute(
            select(Attempt.quiz_id, func.count(Attempt.id))
            .join(Quiz, Quiz.id == Attempt.quiz_id)
            .join(User, User.id == Attempt.user_id)
            .where(
                Quiz.owner_id == teacher.id,
                User.role == UserRole.student,
                Attempt.finished_at.is_not(None),
            )
            .group_by(Attempt.quiz_id)
        ).all()
    )
    quizzes = db.scalars(
        select(Quiz)
        .where(Quiz.owner_id == teacher.id)
        .options(*QUIZ_LOAD_OPTIONS)
        .order_by(Quiz.updated_at.desc(), Quiz.id.desc())
    )
    return [
        TeacherQuizSummary(
            **summary_fields(quiz),
            access_code=quiz.access_code,
            attempt_count=attempt_counts.get(quiz.id, 0),
        )
        for quiz in quizzes
    ]


@router.post("/quizzes", response_model=TeacherQuizDetail, status_code=status.HTTP_201_CREATED)
def create_quiz(data: QuizIn, db: DbSession, teacher: TeacherUser) -> dict[str, Any]:
    quiz = Quiz(owner_id=teacher.id)
    db.add(quiz)
    apply_quiz_input(db, quiz, data)
    db.commit()
    return teacher_detail(_reload(db, quiz.id))


@router.get("/quizzes/{quiz_id}", response_model=TeacherQuizDetail)
def get_my_quiz(quiz_id: int, db: DbSession, teacher: TeacherUser) -> dict[str, Any]:
    return teacher_detail(get_own_quiz(db, quiz_id, teacher))


@router.put("/quizzes/{quiz_id}", response_model=TeacherQuizDetail)
def update_quiz(quiz_id: int, data: QuizIn, db: DbSession, teacher: TeacherUser) -> dict[str, Any]:
    quiz = get_own_quiz(db, quiz_id, teacher)
    apply_quiz_input(db, quiz, data)
    db.commit()
    return teacher_detail(_reload(db, quiz.id))


@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(quiz_id: int, db: DbSession, teacher: TeacherUser) -> Response:
    db.delete(get_own_quiz(db, quiz_id, teacher))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/quizzes/{quiz_id}/duplicate",
    response_model=TeacherQuizDetail,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_quiz(quiz_id: int, db: DbSession, teacher: TeacherUser) -> dict[str, Any]:
    original = get_own_quiz(db, quiz_id, teacher)
    copy = Quiz(
        owner_id=teacher.id,
        title=f"{original.title} (kopija)"[:150],
        description=original.description,
        grade=original.grade,
        status=QuizStatus.draft,
        access_code=None,
        settings=dict(original.settings or {}),
        sources=list(original.sources or []),
        tags=list(original.tags),
        questions=[
            Question(
                position=q.position,
                type=q.type,
                prompt=q.prompt,
                points=q.points,
                hint=q.hint,
                explanation=q.explanation,
                config=dict(q.config or {}),
            )
            for q in original.questions
        ],
    )
    db.add(copy)
    db.commit()
    return teacher_detail(_reload(db, copy.id))


@router.get("/quizzes/{quiz_id}/stats", response_model=QuizStats)
def get_quiz_stats(quiz_id: int, db: DbSession, teacher: TeacherUser) -> dict[str, Any]:
    return quiz_stats(db, get_own_quiz(db, quiz_id, teacher))
