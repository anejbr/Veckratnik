"""Vrste nalog, ki jih učitelj lahko doda v kviz (sandbox).

Vsaka vrsta ima polje `type`. Skupna polja (navodilo, točke, namig, razlaga)
so v svojih stolpcih tabele `questions`, ostalo se shrani v `config` (JSONB).
"""

from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.services.expr import ExpressionError, evaluate

COMMON_FIELDS = {"id", "type", "prompt", "points", "hint", "explanation"}


class QuestionBase(BaseModel):
    # id obstoječe naloge pri urejanju (da statistika po nalogah ostane povezana)
    id: int | None = None
    prompt: str = Field(default="", max_length=2000)
    points: int = Field(default=1, ge=0, le=100)
    hint: str | None = Field(default=None, max_length=500)
    explanation: str | None = Field(default=None, max_length=1000)
    image_url: str | None = Field(default=None, max_length=500)

    def config(self) -> dict[str, Any]:
        return self.model_dump(mode="json", exclude=COMMON_FIELDS)


class Option(BaseModel):
    id: str = Field(min_length=1, max_length=20)
    text: str = Field(min_length=1, max_length=300)


def _unique_option_ids(options: list[Option]) -> list[Option]:
    ids = [option.id for option in options]
    if len(ids) != len(set(ids)):
        raise ValueError("Možnosti morajo imeti različne oznake.")
    return options


class SingleChoiceQuestion(QuestionBase):
    type: Literal["single_choice"]
    options: list[Option] = Field(min_length=2, max_length=8)
    correct: str

    _check_ids = field_validator("options")(_unique_option_ids)

    @model_validator(mode="after")
    def check_correct(self) -> "SingleChoiceQuestion":
        if self.correct not in {option.id for option in self.options}:
            raise ValueError("Označi pravilno možnost.")
        return self


class MultipleChoiceQuestion(QuestionBase):
    type: Literal["multiple_choice"]
    options: list[Option] = Field(min_length=2, max_length=10)
    correct: list[str] = Field(min_length=1)

    _check_ids = field_validator("options")(_unique_option_ids)

    @model_validator(mode="after")
    def check_correct(self) -> "MultipleChoiceQuestion":
        ids = {option.id for option in self.options}
        if not set(self.correct) <= ids:
            raise ValueError("Pravilni odgovori se morajo ujemati z možnostmi.")
        self.correct = sorted(set(self.correct))
        return self


class TrueFalseQuestion(QuestionBase):
    type: Literal["true_false"]
    correct: bool


class NumericQuestion(QuestionBase):
    type: Literal["numeric"]
    answer: float
    tolerance: float = Field(default=0, ge=0)
    unit: str | None = Field(default=None, max_length=20)


class ShortTextQuestion(QuestionBase):
    type: Literal["short_text"]
    accepted: list[Annotated[str, Field(min_length=1, max_length=100)]] = Field(min_length=1, max_length=10)
    case_sensitive: bool = False


class FillBlankQuestion(QuestionBase):
    """Npr. template "7 · {} = 56", answers ["8"]."""

    type: Literal["fill_blank"]
    template: str = Field(min_length=3, max_length=300)
    answers: list[Annotated[str, Field(min_length=1, max_length=50)]] = Field(min_length=1, max_length=10)

    @model_validator(mode="after")
    def check_blanks(self) -> "FillBlankQuestion":
        if self.template.count("{}") != len(self.answers):
            raise ValueError("Število praznih mest {} se mora ujemati s številom odgovorov.")
        return self


class CompareQuestion(QuestionBase):
    """Učenec izbere <, > ali = med izrazoma."""

    type: Literal["compare"]
    left: str = Field(min_length=1, max_length=100)
    right: str = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def check_expressions(self) -> "CompareQuestion":
        for expression in (self.left, self.right):
            try:
                evaluate(expression)
            except ExpressionError as exc:
                raise ValueError(str(exc)) from exc
        return self


class OrderingQuestion(QuestionBase):
    """Elementi so podani v pravilnem vrstnem redu, učenec jih dobi premešane."""

    type: Literal["ordering"]
    items: list[Annotated[str, Field(min_length=1, max_length=100)]] = Field(min_length=2, max_length=10)
    direction_label: str = Field(default="od najmanjšega do največjega", max_length=60)


class MatchingPair(BaseModel):
    left: str = Field(min_length=1, max_length=100)
    right: str = Field(min_length=1, max_length=100)


class MatchingQuestion(QuestionBase):
    type: Literal["matching"]
    pairs: list[MatchingPair] = Field(min_length=2, max_length=8)


class MultiplesGridQuestion(QuestionBase):
    """Učenec v mreži števil označi vse večkratnike (ali delitelje) števila."""

    type: Literal["multiples_grid"]
    mode: Literal["multiples", "divisors"] = "multiples"
    number: int = Field(ge=1, le=200)
    range_from: int = Field(default=1, ge=1, le=500)
    range_to: int = Field(default=30, ge=1, le=500)

    @model_validator(mode="after")
    def check_range(self) -> "MultiplesGridQuestion":
        if self.mode == "divisors":
            self.range_from, self.range_to = 1, self.number
        if self.range_from >= self.range_to:
            raise ValueError("Začetek razpona mora biti manjši od konca.")
        if self.range_to - self.range_from > 99:
            raise ValueError("Mreža ima lahko največ 100 števil.")
        return self


class TimesTableQuestion(QuestionBase):
    """Generator poštevanke – ob vsakem reševanju nastanejo novi računi.

    `points` velja za vsak račun posebej.
    """

    type: Literal["times_table"]
    factors: list[Annotated[int, Field(ge=1, le=12)]] = Field(min_length=1, max_length=12)
    max_multiplier: int = Field(default=10, ge=1, le=12)
    operation: Literal["multiply", "divide", "mixed"] = "multiply"
    count: int = Field(default=10, ge=1, le=50)


class ArithmeticQuestion(QuestionBase):
    """Generator računov s seštevanjem, odštevanjem, množenjem in deljenjem."""

    type: Literal["arithmetic"]
    operations: list[Literal["+", "-", "*", ":"]] = Field(min_length=1)
    min_value: int = Field(default=0, ge=0, le=10_000)
    max_value: int = Field(default=20, ge=1, le=10_000)
    count: int = Field(default=10, ge=1, le=50)
    allow_negative: bool = False

    @model_validator(mode="after")
    def check_range(self) -> "ArithmeticQuestion":
        if self.min_value >= self.max_value:
            raise ValueError("Najmanjše število mora biti manjše od največjega.")
        self.operations = sorted(set(self.operations), key="+-*:".index)
        return self


class InfoBlock(QuestionBase):
    """Besedilo ali slika brez točk (npr. uvod ali razlaga)."""

    type: Literal["info"]

    @model_validator(mode="after")
    def no_points(self) -> "InfoBlock":
        self.points = 0
        return self


QuestionIn = Annotated[
    SingleChoiceQuestion
    | MultipleChoiceQuestion
    | TrueFalseQuestion
    | NumericQuestion
    | ShortTextQuestion
    | FillBlankQuestion
    | CompareQuestion
    | OrderingQuestion
    | MatchingQuestion
    | MultiplesGridQuestion
    | TimesTableQuestion
    | ArithmeticQuestion
    | InfoBlock,
    Field(discriminator="type"),
]

GENERATOR_TYPES = {"times_table", "arithmetic"}
QUESTION_TYPES = {
    "single_choice",
    "multiple_choice",
    "true_false",
    "numeric",
    "short_text",
    "fill_blank",
    "compare",
    "ordering",
    "matching",
    "multiples_grid",
    "times_table",
    "arithmetic",
    "info",
}
