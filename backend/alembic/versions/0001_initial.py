"""začetna shema

Revision ID: 0001
Revises:
Create Date: 2026-10-12 11:05:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("role", sa.Enum("teacher", "student", name="user_role"), nullable=False),
        sa.Column("username", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("grade", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_role", "users", ["role"])
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(40), nullable=False),
    )
    op.create_index("ix_tags_name", "tags", ["name"], unique=True)

    op.create_table(
        "quizzes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("grade", sa.Integer(), nullable=True),
        sa.Column("status", sa.Enum("draft", "published", name="quiz_status"), nullable=False),
        sa.Column("access_code", sa.String(20), nullable=True),
        sa.Column("settings", postgresql.JSONB(), nullable=False),
        sa.Column("sources", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_quizzes_owner_id", "quizzes", ["owner_id"])
    op.create_index("ix_quizzes_status", "quizzes", ["status"])

    op.create_table(
        "quiz_tags",
        sa.Column("quiz_id", sa.Integer(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", sa.Integer(), sa.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quiz_id", sa.Integer(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(30), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("hint", sa.Text(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("config", postgresql.JSONB(), nullable=False),
    )
    op.create_index("ix_questions_quiz_id", "questions", ["quiz_id"])

    op.create_table(
        "attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quiz_id", sa.Integer(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("max_score", sa.Float(), nullable=False),
        sa.Column("timed_out", sa.Boolean(), nullable=False),
        sa.Column("snapshot", postgresql.JSONB(), nullable=False),
        sa.Column("answers", postgresql.JSONB(), nullable=True),
        sa.Column("results", postgresql.JSONB(), nullable=True),
    )
    op.create_index("ix_attempts_quiz_id", "attempts", ["quiz_id"])
    op.create_index("ix_attempts_user_id", "attempts", ["user_id"])


def downgrade() -> None:
    op.drop_table("attempts")
    op.drop_table("questions")
    op.drop_table("quiz_tags")
    op.drop_table("quizzes")
    op.drop_table("tags")
    op.drop_table("users")
    sa.Enum(name="quiz_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
