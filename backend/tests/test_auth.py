from fastapi.testclient import TestClient

from app.core.config import settings
from tests.conftest import register_student, register_teacher


def test_student_register_and_me(client: TestClient) -> None:
    headers = register_student(client, "Ana.K")
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "ana.k"
    assert body["role"] == "student"
    assert body["grade"] == 3


def test_duplicate_username(client: TestClient) -> None:
    register_student(client, "miha")
    response = client.post(
        "/api/auth/student/register",
        json={"username": "miha", "full_name": "Drugi Miha", "password": "geslo123"},
    )
    assert response.status_code == 409


def test_student_login(client: TestClient) -> None:
    register_student(client, "miha")
    ok = client.post("/api/auth/student/login", json={"username": "MIHA", "password": "geslo123"})
    assert ok.status_code == 200
    assert ok.json()["user"]["role"] == "student"

    wrong = client.post("/api/auth/student/login", json={"username": "miha", "password": "narobe"})
    assert wrong.status_code == 401


def test_teacher_register_requires_code(client: TestClient) -> None:
    response = client.post(
        "/api/auth/teacher/register",
        json={
            "email": "ucitelj@sola.si",
            "full_name": "Marija Novak",
            "password": "skrivnost123",
            "teacher_code": "napacna-koda",
        },
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Napačna učiteljska koda."


def test_teacher_login_requires_code(client: TestClient) -> None:
    register_teacher(client, "ucitelj@sola.si")
    base = {"email": "ucitelj@sola.si", "password": "skrivnost123"}

    wrong = client.post("/api/auth/teacher/login", json={**base, "teacher_code": "xyz"})
    assert wrong.status_code == 403

    ok = client.post(
        "/api/auth/teacher/login", json={**base, "teacher_code": settings.teacher_access_code}
    )
    assert ok.status_code == 200
    assert ok.json()["user"]["role"] == "teacher"


def test_login_on_wrong_page(client: TestClient) -> None:
    register_teacher(client, "ucitelj@sola.si")
    register_student(client, "miha")

    teacher_as_student = client.post(
        "/api/auth/student/login", json={"username": "ucitelj@sola.si", "password": "skrivnost123"}
    )
    assert teacher_as_student.status_code == 403
    assert "učiteljski" in teacher_as_student.json()["detail"]

    student_as_teacher = client.post(
        "/api/auth/teacher/login",
        json={
            "email": "miha",
            "password": "geslo123",
            "teacher_code": settings.teacher_access_code,
        },
    )
    assert student_as_teacher.status_code == 403
    assert "učenčev" in student_as_teacher.json()["detail"]


def test_validation_message_in_slovenian(client: TestClient) -> None:
    response = client.post(
        "/api/auth/student/register",
        json={"username": "miha", "full_name": "Miha", "password": "123"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Geslo: najmanj 6 znakov."


def test_me_requires_token(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code == 401
    bad = client.get("/api/auth/me", headers={"Authorization": "Bearer neveljaven"})
    assert bad.status_code == 401
