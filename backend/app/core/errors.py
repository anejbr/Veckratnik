from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

FIELD_NAMES = {
    "username": "Uporabniško ime",
    "password": "Geslo",
    "full_name": "Ime in priimek",
    "email": "E-naslov",
    "grade": "Razred",
    "teacher_code": "Učiteljska koda",
    "title": "Naslov",
    "questions": "Naloge",
    "access_code": "Koda za dostop",
}


def _message(error: dict) -> str:
    loc = [part for part in error.get("loc", []) if part not in ("body", "query", "path")]
    if len(loc) > 1 and loc[0] == "questions" and isinstance(loc[1], int):
        field = f"Naloga {loc[1] + 1}"
    elif loc:
        field = FIELD_NAMES.get(str(loc[0]), str(loc[0]))
    else:
        field = "Vnos"
    ctx = error.get("ctx") or {}
    match error.get("type"):
        case "missing":
            return f"{field}: polje je obvezno."
        case "string_too_short":
            return f"{field}: najmanj {ctx.get('min_length')} znakov."
        case "string_too_long":
            return f"{field}: največ {ctx.get('max_length')} znakov."
        case "string_pattern_mismatch":
            return f"{field}: dovoljene so le črke brez šumnikov, številke ter znaki . _ -"
        case "greater_than_equal" | "greater_than":
            return f"{field}: vrednost je premajhna."
        case "less_than_equal" | "less_than":
            return f"{field}: vrednost je prevelika."
        case "value_error" if loc and loc[0] == "email":
            return f"{field}: ni veljaven e-naslov."
        case _:
            msg = str(error.get("msg", "neveljavna vrednost")).removeprefix("Value error, ")
            return f"{field}: {msg}"


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [_message(err) for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"detail": errors[0] if errors else "Neveljavni podatki.", "errors": errors},
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
