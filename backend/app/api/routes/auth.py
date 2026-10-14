from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.security import check_teacher_code, create_access_token, hash_password, verify_password
from app.models import User, UserRole
from app.schemas.auth import StudentLogin, StudentRegister, TeacherLogin, TeacherRegister, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

WRONG_CREDENTIALS = "Napačno uporabniško ime ali geslo."
WRONG_TEACHER_CODE = "Napačna učiteljska koda."


def _token_response(user: User) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id, user.role.value),
        user=UserOut.model_validate(user),
    )


def _username_taken(db: DbSession, username: str) -> bool:
    return db.scalar(select(User.id).where(User.username == username)) is not None


@router.post("/student/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register_student(data: StudentRegister, db: DbSession) -> TokenOut:
    if _username_taken(db, data.username):
        raise HTTPException(status.HTTP_409_CONFLICT, "To uporabniško ime je že zasedeno.")
    user = User(
        role=UserRole.student,
        username=data.username,
        full_name=data.full_name.strip(),
        password_hash=hash_password(data.password),
        grade=data.grade,
    )
    db.add(user)
    db.commit()
    return _token_response(user)


@router.post("/student/login", response_model=TokenOut)
def login_student(data: StudentLogin, db: DbSession) -> TokenOut:
    user = db.scalar(select(User).where(User.username == data.username.strip().lower()))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, WRONG_CREDENTIALS)
    if user.role != UserRole.student:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Ta račun je učiteljski. Prijavi se na strani za učitelje."
        )
    return _token_response(user)


@router.post("/teacher/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register_teacher(data: TeacherRegister, db: DbSession) -> TokenOut:
    if not check_teacher_code(data.teacher_code):
        raise HTTPException(status.HTTP_403_FORBIDDEN, WRONG_TEACHER_CODE)
    email = data.email.lower()
    if _username_taken(db, email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Račun s tem e-naslovom že obstaja.")
    user = User(
        role=UserRole.teacher,
        username=email,
        full_name=data.full_name.strip(),
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    return _token_response(user)


@router.post("/teacher/login", response_model=TokenOut)
def login_teacher(data: TeacherLogin, db: DbSession) -> TokenOut:
    user = db.scalar(select(User).where(User.username == data.email.strip().lower()))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Napačen e-naslov ali geslo.")
    if user.role != UserRole.teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Ta račun je učenčev. Prijavi se na strani za učence."
        )
    if not check_teacher_code(data.teacher_code):
        raise HTTPException(status.HTTP_403_FORBIDDEN, WRONG_TEACHER_CODE)
    return _token_response(user)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> User:
    return user
