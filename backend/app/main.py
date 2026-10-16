from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, quizzes, teacher
from app.core.config import settings
from app.core.errors import register_error_handlers

app = FastAPI(title="Večkratnik API", version="0.1.0")
register_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(quizzes.router)
app.include_router(teacher.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
