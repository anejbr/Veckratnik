from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import UserRole

USERNAME_PATTERN = r"^[a-zA-Z0-9._-]+$"


class StudentRegister(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=USERNAME_PATTERN)
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=6, max_length=128)
    grade: int | None = Field(default=None, ge=1, le=9)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.lower()


class StudentLogin(BaseModel):
    username: str
    password: str


class TeacherRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    teacher_code: str


class TeacherLogin(BaseModel):
    email: str
    password: str
    teacher_code: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    username: str
    full_name: str
    grade: int | None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
