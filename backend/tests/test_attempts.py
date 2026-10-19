from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Attempt
from tests.conftest import register_student

QUESTIONS = [
    {"type": "info", "prompt": "Uvod"},
    {"type": "true_false", "prompt": "2 · 3 = 6", "points": 2, "correct": True},
    {"type": "times_table", "prompt": "Poštevanka", "factors": [2], "operation": "multiply", "count": 3},
]


def create_quiz(client: TestClient, headers: dict[str, str], **overrides) -> dict:
    payload = {"title": "Poštevanka 2", "status": "published", "questions": QUESTIONS, **overrides}
    response = client.post("/api/teacher/quizzes", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_full_attempt_flow(
    client: TestClient, db_session: Session, teacher_headers: dict[str, str], student_headers: dict[str, str]
) -> None:
    quiz = create_quiz(client, teacher_headers)
    start = client.post(f"/api/quizzes/{quiz['id']}/attempts", json={}, headers=student_headers)
    assert start.status_code == 201, start.text
    view = start.json()
    assert [q["type"] for q in view["questions"]] == ["info", "true_false", "times_table"]
    assert "correct" not in view["questions"][1]

    # simuliramo, da je učenec reševal 95 sekund
    attempt = db_session.get(Attempt, view["id"])
    attempt.started_at = datetime.now(UTC) - timedelta(seconds=95)
    db_session.commit()

    snapshot = db_session.get(Attempt, view["id"]).snapshot
    generated = snapshot[2]["items"]
    answers = {
        snapshot[1]["id"]: True,
        snapshot[2]["id"]: {generated[0]["id"]: str(generated[0]["answer"]), generated[1]["id"]: "999"},
    }
    result = client.post(f"/api/attempts/{view['id']}/submit", json={"answers": answers}, headers=student_headers)
    assert result.status_code == 200, result.text
    body = result.json()
    assert (body["score"], body["max_score"]) == (3, 5)
    assert body["percent"] == 60.0
    assert 95 <= body["duration_seconds"] <= 97
    assert body["attempt_number"] == 1
    assert body["previous_best"] is None
    assert body["student_name"] == "Miha Kovač"

    again = client.post(f"/api/attempts/{view['id']}/submit", json={"answers": {}}, headers=student_headers)
    assert again.status_code == 409

    mine = client.get("/api/attempts/me", headers=student_headers).json()
    assert [a["id"] for a in mine] == [view["id"]]

    listed = client.get("/api/quizzes", headers=student_headers).json()[0]
    assert listed["my_attempts"] == 1
    assert listed["my_best_percent"] == 60.0

    # učitelj vidi poskus svojega učenca, drug učenec ne
    assert client.get(f"/api/attempts/{view['id']}", headers=teacher_headers).status_code == 200
    other = register_student(client, "ana")
    assert client.get(f"/api/attempts/{view['id']}", headers=other).status_code == 404


def test_locked_quiz_requires_code(
    client: TestClient, teacher_headers: dict[str, str], student_headers: dict[str, str]
) -> None:
    quiz = create_quiz(client, teacher_headers, access_code="MATE-5")
    url = f"/api/quizzes/{quiz['id']}/attempts"
    assert "zaklenjen" in client.post(url, json={}, headers=student_headers).json()["detail"]
    assert client.post(url, json={"access_code": "napak"}, headers=student_headers).status_code == 403
    assert client.post(url, json={"access_code": " mate-5 "}, headers=student_headers).status_code == 201
    # lastnik lahko kviz preizkusi brez kode
    assert client.post(url, json={}, headers=teacher_headers).status_code == 201


def test_max_attempts(client: TestClient, teacher_headers: dict[str, str], student_headers: dict[str, str]) -> None:
    quiz = create_quiz(client, teacher_headers, settings={"max_attempts": 1})
    url = f"/api/quizzes/{quiz['id']}/attempts"
    attempt = client.post(url, json={}, headers=student_headers).json()
    client.post(f"/api/attempts/{attempt['id']}/submit", json={"answers": {}}, headers=student_headers)
    blocked = client.post(url, json={}, headers=student_headers)
    assert blocked.status_code == 403


def test_hidden_answers_and_resume(
    client: TestClient, teacher_headers: dict[str, str], student_headers: dict[str, str]
) -> None:
    quiz = create_quiz(client, teacher_headers, settings={"show_correct_answers": False})
    attempt = client.post(f"/api/quizzes/{quiz['id']}/attempts", json={}, headers=student_headers).json()

    resumed = client.get(f"/api/attempts/{attempt['id']}", headers=student_headers).json()
    assert resumed["questions"] == attempt["questions"]

    result = client.post(f"/api/attempts/{attempt['id']}/submit", json={"answers": {}}, headers=student_headers).json()
    assert result["show_correct_answers"] is False
    assert all(r["expected"] is None for r in result["results"])
    second = client.post(f"/api/quizzes/{quiz['id']}/attempts", json={}, headers=student_headers).json()
    second_result = client.post(f"/api/attempts/{second['id']}/submit", json={"answers": {}}, headers=student_headers).json()
    assert second_result["attempt_number"] == 2
    assert second_result["previous_best"] == {"percent": 0.0, "duration_seconds": result["duration_seconds"]}
