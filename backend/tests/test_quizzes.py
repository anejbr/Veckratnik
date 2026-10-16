from typing import Any

from fastapi.testclient import TestClient

from tests.conftest import register_teacher

ALL_QUESTIONS: list[dict[str, Any]] = [
    {"type": "info", "prompt": "Pozdravljen! Reši naloge.", "points": 5},
    {
        "type": "single_choice",
        "prompt": "Koliko je 6 · 7?",
        "options": [{"id": "a", "text": "42"}, {"id": "b", "text": "36"}],
        "correct": "a",
    },
    {
        "type": "multiple_choice",
        "prompt": "Kateri so večkratniki števila 3?",
        "options": [{"id": "a", "text": "9"}, {"id": "b", "text": "10"}, {"id": "c", "text": "12"}],
        "correct": ["c", "a"],
    },
    {"type": "true_false", "prompt": "8 · 0 = 8", "correct": False},
    {"type": "numeric", "prompt": "Ana ima 3 vrečke po 4 jabolka. Koliko jabolk ima?", "answer": 12, "unit": "jabolk"},
    {"type": "short_text", "prompt": "Kako imenujemo rezultat množenja?", "accepted": ["zmnožek", "produkt"]},
    {"type": "fill_blank", "prompt": "Dopolni.", "template": "7 · {} = 56", "answers": ["8"]},
    {"type": "compare", "prompt": "Primerjaj.", "left": "3 · 4", "right": "2 · 6"},
    {"type": "ordering", "prompt": "Uredi.", "items": ["12", "24", "36"]},
    {"type": "matching", "prompt": "Poveži.", "pairs": [{"left": "2 · 5", "right": "10"}, {"left": "3 · 3", "right": "9"}]},
    {"type": "multiples_grid", "prompt": "Označi večkratnike števila 4.", "number": 4, "range_from": 1, "range_to": 40},
    {"type": "times_table", "prompt": "Poštevanka", "factors": [2, 5, 10], "count": 5},
    {"type": "arithmetic", "prompt": "Izračunaj.", "operations": ["+", "-"], "max_value": 20, "count": 5},
]


def quiz_payload(**overrides: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "title": "Poštevanka in večkratniki",
        "description": "Vaja za 3. razred",
        "grade": 3,
        "status": "published",
        "tags": ["Poštevanka", "#3. razred"],
        "settings": {"theme": "emerald", "emoji": "🐸", "time_limit_seconds": 300},
        "questions": ALL_QUESTIONS,
    }
    payload.update(overrides)
    return payload


def test_create_quiz_with_all_question_types(client: TestClient, teacher_headers: dict[str, str]) -> None:
    response = client.post("/api/teacher/quizzes", json=quiz_payload(), headers=teacher_headers)
    assert response.status_code == 201, response.text
    quiz = response.json()
    assert len(quiz["questions"]) == len(ALL_QUESTIONS)
    assert quiz["tags"] == ["3. razred", "poštevanka"]
    assert quiz["settings"]["theme"] == "emerald"
    assert quiz["questions"][0]["points"] == 0  # info blok nima točk
    assert quiz["questions"][2]["correct"] == ["a", "c"]
    assert quiz["questions"][1]["options"][0]["text"] == "42"


def test_student_cannot_create_quiz(client: TestClient, student_headers: dict[str, str]) -> None:
    response = client.post("/api/teacher/quizzes", json=quiz_payload(), headers=student_headers)
    assert response.status_code == 403


def test_invalid_question_message(client: TestClient, teacher_headers: dict[str, str]) -> None:
    bad = {"type": "single_choice", "options": [{"id": "a", "text": "1"}, {"id": "b", "text": "2"}], "correct": "x"}
    response = client.post(
        "/api/teacher/quizzes", json=quiz_payload(questions=[bad]), headers=teacher_headers
    )
    assert response.status_code == 422
    assert response.json()["detail"].startswith("Naloga 1:")


def test_published_quiz_needs_questions(client: TestClient, teacher_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/teacher/quizzes", json=quiz_payload(questions=[]), headers=teacher_headers
    )
    assert response.status_code == 422
    draft = client.post(
        "/api/teacher/quizzes",
        json=quiz_payload(questions=[], status="draft"),
        headers=teacher_headers,
    )
    assert draft.status_code == 201


def test_public_list_filters(
    client: TestClient, teacher_headers: dict[str, str], student_headers: dict[str, str]
) -> None:
    client.post("/api/teacher/quizzes", json=quiz_payload(), headers=teacher_headers)
    client.post(
        "/api/teacher/quizzes",
        json=quiz_payload(title="Ulomki", tags=["ulomki"], grade=5, status="draft", questions=[]),
        headers=teacher_headers,
    )
    client.post(
        "/api/teacher/quizzes",
        json=quiz_payload(title="Deljenje", tags=["deljenje"], grade=4, access_code="abcd"),
        headers=teacher_headers,
    )

    all_quizzes = client.get("/api/quizzes", headers=student_headers).json()
    assert {q["title"] for q in all_quizzes} == {"Poštevanka in večkratniki", "Deljenje"}
    locked = next(q for q in all_quizzes if q["title"] == "Deljenje")
    assert locked["locked"] is True
    assert "access_code" not in locked
    # info blok se ne šteje, generatorja štejeta po 5 računov
    assert locked["question_count"] == 10 + 5 + 5

    by_tag = client.get("/api/quizzes", params={"tag": "Poštevanka"}, headers=student_headers).json()
    assert [q["title"] for q in by_tag] == ["Poštevanka in večkratniki"]
    by_grade = client.get("/api/quizzes", params={"grade": 4}, headers=student_headers).json()
    assert [q["title"] for q in by_grade] == ["Deljenje"]
    by_title = client.get("/api/quizzes", params={"search": "večkrat"}, headers=student_headers).json()
    assert len(by_title) == 1
    by_description = client.get("/api/quizzes", params={"search": "razred"}, headers=student_headers).json()
    assert len(by_description) == 2

    tags = client.get("/api/tags", headers=student_headers).json()
    assert {"name": "poštevanka", "quiz_count": 1} in tags
    assert all(tag["name"] != "ulomki" for tag in tags)  # osnutki se ne štejejo


def test_draft_is_hidden_from_students(
    client: TestClient, teacher_headers: dict[str, str], student_headers: dict[str, str]
) -> None:
    quiz = client.post(
        "/api/teacher/quizzes", json=quiz_payload(status="draft"), headers=teacher_headers
    ).json()
    assert client.get(f"/api/quizzes/{quiz['id']}", headers=student_headers).status_code == 404
    assert client.get(f"/api/quizzes/{quiz['id']}", headers=teacher_headers).json()["is_owner"] is True


def test_update_keeps_question_ids(client: TestClient, teacher_headers: dict[str, str]) -> None:
    quiz = client.post("/api/teacher/quizzes", json=quiz_payload(), headers=teacher_headers).json()
    questions = quiz["questions"]
    kept = questions[1]
    kept["prompt"] = "Koliko je 7 · 6?"
    new_question = {"type": "true_false", "prompt": "2 · 2 = 4", "correct": True}

    response = client.put(
        f"/api/teacher/quizzes/{quiz['id']}",
        json=quiz_payload(questions=[new_question, kept], access_code="  koda-1 "),
        headers=teacher_headers,
    )
    assert response.status_code == 200, response.text
    updated = response.json()
    assert [q["type"] for q in updated["questions"]] == ["true_false", "single_choice"]
    assert updated["questions"][1]["id"] == kept["id"]
    assert updated["questions"][1]["prompt"] == "Koliko je 7 · 6?"
    assert updated["access_code"] == "KODA-1"


def test_other_teacher_cannot_edit(client: TestClient, teacher_headers: dict[str, str]) -> None:
    quiz = client.post("/api/teacher/quizzes", json=quiz_payload(), headers=teacher_headers).json()
    other = register_teacher(client, "drugi@sola.si")
    assert client.get(f"/api/teacher/quizzes/{quiz['id']}", headers=other).status_code == 404
    assert client.delete(f"/api/teacher/quizzes/{quiz['id']}", headers=other).status_code == 404


def test_duplicate_and_delete(client: TestClient, teacher_headers: dict[str, str]) -> None:
    quiz = client.post(
        "/api/teacher/quizzes", json=quiz_payload(access_code="TAJNO"), headers=teacher_headers
    ).json()
    copy = client.post(f"/api/teacher/quizzes/{quiz['id']}/duplicate", headers=teacher_headers).json()
    assert copy["title"].endswith("(kopija)")
    assert copy["status"] == "draft"
    assert copy["access_code"] is None
    assert len(copy["questions"]) == len(quiz["questions"])

    assert client.delete(f"/api/teacher/quizzes/{quiz['id']}", headers=teacher_headers).status_code == 204
    mine = client.get("/api/teacher/quizzes", headers=teacher_headers).json()
    assert [q["id"] for q in mine] == [copy["id"]]
