from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401  (registrira modele v metadata)
from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture
def db_session() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_teacher(client: TestClient, email: str = "ucitelj@sola.si") -> dict[str, str]:
    response = client.post(
        "/api/auth/teacher/register",
        json={
            "email": email,
            "full_name": "Marija Novak",
            "password": "skrivnost123",
            "teacher_code": settings.teacher_access_code,
        },
    )
    assert response.status_code == 201, response.text
    return auth_headers(response.json()["access_token"])


def register_student(client: TestClient, username: str = "miha") -> dict[str, str]:
    response = client.post(
        "/api/auth/student/register",
        json={"username": username, "full_name": "Miha Kovač", "password": "geslo123", "grade": 3},
    )
    assert response.status_code == 201, response.text
    return auth_headers(response.json()["access_token"])


@pytest.fixture
def teacher_headers(client: TestClient) -> dict[str, str]:
    return register_teacher(client)


@pytest.fixture
def student_headers(client: TestClient) -> dict[str, str]:
    return register_student(client)
