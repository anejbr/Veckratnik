"""Napolni bazo z demo uporabniki in kvizi: `python -m app.seed`.

Zažene se ob zagonu containerja (če je SEED_DEMO_DATA=true) in ne naredi
ničesar, če demo učitelj že obstaja.
"""

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import Quiz, User, UserRole
from app.schemas.quiz import QuizIn
from app.seed.data import QUIZZES
from app.seed.simulate import simulate_attempts
from app.services.quizzes import apply_quiz_input

DEMO_TEACHER = {"username": "ucitelj@veckratnik.si", "full_name": "Demo Učitelj", "password": "ucitelj123"}
DEMO_STUDENTS = [
    ("ucenec", "Demo Učenec", 3),
    ("lana.h", "Lana Horvat", 3),
    ("jan.z", "Jan Zupan", 3),
    ("eva.k", "Eva Kralj", 4),
    ("tim.n", "Tim Novak", 2),
    ("zala.p", "Zala Potočnik", 5),
]
STUDENT_PASSWORD = "ucenec123"


def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(User.id).where(User.username == DEMO_TEACHER["username"])):
            print("Demo podatki že obstajajo – preskočeno.")
            return

        teacher = User(
            role=UserRole.teacher,
            username=DEMO_TEACHER["username"],
            full_name=DEMO_TEACHER["full_name"],
            password_hash=hash_password(DEMO_TEACHER["password"]),
        )
        db.add(teacher)
        student_hash = hash_password(STUDENT_PASSWORD)
        students = [
            User(role=UserRole.student, username=username, full_name=name, grade=grade, password_hash=student_hash)
            for username, name, grade in DEMO_STUDENTS
        ]
        db.add_all(students)
        db.flush()

        quizzes = []
        for item in QUIZZES:
            data = QuizIn.model_validate({**item, "status": "published"})
            quiz = Quiz(owner_id=teacher.id)
            db.add(quiz)
            apply_quiz_input(db, quiz, data)
            db.flush()
            quizzes.append(quiz)

        # demo učenec ostane brez poskusov, da lahko kvize preizkusi od začetka
        attempts = simulate_attempts(db, quizzes, students[1:])
        db.commit()
        print(f"Dodanih {len(QUIZZES)} demo kvizov, 1 učitelj, {len(students)} učencev in {attempts} poskusov.")


if __name__ == "__main__":
    seed()
