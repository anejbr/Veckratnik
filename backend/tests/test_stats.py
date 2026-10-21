from fastapi.testclient import TestClient

from tests.conftest import register_student

QUESTIONS = [
    {"type": "true_false", "prompt": "2 · 3 = 6", "points": 1, "correct": True},
    {"type": "true_false", "prompt": "4 · 4 = 18", "points": 1, "correct": False},
]


def solve(client: TestClient, quiz_id: int, headers: dict[str, str], answers: list[bool | None]) -> dict:
    attempt = client.post(f"/api/quizzes/{quiz_id}/attempts", json={}, headers=headers).json()
    ids = [q["id"] for q in attempt["questions"]]
    payload = {qid: value for qid, value in zip(ids, answers) if value is not None}
    return client.post(f"/api/attempts/{attempt['id']}/submit", json={"answers": payload}, headers=headers).json()


def test_quiz_stats(client: TestClient, teacher_headers: dict[str, str]) -> None:
    quiz = client.post(
        "/api/teacher/quizzes",
        json={"title": "Drži ali ne", "status": "published", "questions": QUESTIONS},
        headers=teacher_headers,
    ).json()
    miha = register_student(client, "miha")
    ana = register_student(client, "ana")

    solve(client, quiz["id"], miha, [True, True])  # 50 %
    solve(client, quiz["id"], miha, [True, False])  # 100 %
    solve(client, quiz["id"], ana, [False, None])  # 0 %
    # poskus učitelja se ne šteje
    solve(client, quiz["id"], teacher_headers, [True, False])

    response = client.get(f"/api/teacher/quizzes/{quiz['id']}/stats", headers=teacher_headers)
    assert response.status_code == 200
    stats = response.json()

    summary = stats["summary"]
    assert summary["attempts"] == 3
    assert summary["students"] == 2
    assert summary["average_percent"] == 50.0
    assert summary["perfect_count"] == 1
    assert [b["count"] for b in stats["distribution"]] == [1, 0, 1, 0, 1]

    first, second = stats["questions"]
    assert first["success_rate"] == round(200 / 3, 1)
    assert second["success_rate"] == round(100 / 3, 1)
    assert second["label"] == "4 · 4 = 18"

    students = {s["student_name"]: s for s in stats["students"]}
    assert students["Miha Kovač"]["attempts"] == 2
    assert students["Miha Kovač"]["best_percent"] == 100.0
    assert [row["attempt_number"] for row in stats["attempts"] if row["username"] == "miha"] == [2, 1]

    csv = client.get(f"/api/teacher/quizzes/{quiz['id']}/results.csv", headers=teacher_headers)
    assert csv.status_code == 200
    lines = csv.content.decode("utf-8-sig").strip().splitlines()
    assert lines[0].startswith("Učenec;Uporabniško ime")
    assert len(lines) == 4


def test_stats_only_for_owner(client: TestClient, teacher_headers: dict[str, str], student_headers: dict[str, str]) -> None:
    quiz = client.post(
        "/api/teacher/quizzes", json={"title": "Moj kviz", "questions": QUESTIONS}, headers=teacher_headers
    ).json()
    assert client.get(f"/api/teacher/quizzes/{quiz['id']}/stats", headers=student_headers).status_code == 403
