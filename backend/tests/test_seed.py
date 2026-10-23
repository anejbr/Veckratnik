import pytest

from app.schemas.quiz import QuizIn
from app.seed.data import QUIZZES


@pytest.mark.parametrize("quiz", QUIZZES, ids=[q["title"] for q in QUIZZES])
def test_demo_quizzes_are_valid(quiz: dict) -> None:
    data = QuizIn.model_validate({**quiz, "status": "published"})
    assert data.sources, "vsak demo kviz naj navaja vire"
    assert data.tags
