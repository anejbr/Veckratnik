"""Varno računanje preprostih aritmetičnih izrazov (brez eval)."""

import ast
from fractions import Fraction

MAX_EXPRESSION_LENGTH = 100

_REPLACEMENTS = {"·": "*", "×": "*", "x": "*", ":": "/", "÷": "/", "−": "-", ",": "."}


class ExpressionError(ValueError):
    pass


def normalize(expression: str) -> str:
    text = expression.strip()
    for old, new in _REPLACEMENTS.items():
        text = text.replace(old, new)
    return text


def evaluate(expression: str) -> Fraction:
    """Izračuna izraz s +, -, ·, :, oklepaji in decimalnimi števili."""
    if len(expression) > MAX_EXPRESSION_LENGTH:
        raise ExpressionError("Izraz je predolg.")
    try:
        tree = ast.parse(normalize(expression), mode="eval")
    except SyntaxError as exc:
        raise ExpressionError(f"Neveljaven izraz: {expression}") from exc
    return _eval(tree.body)


def _eval(node: ast.AST) -> Fraction:
    match node:
        case ast.Constant(value=bool()):
            raise ExpressionError("Neveljaven izraz.")
        case ast.Constant(value=int() | float() as value):
            return Fraction(str(value))
        case ast.UnaryOp(op=ast.USub(), operand=operand):
            return -_eval(operand)
        case ast.UnaryOp(op=ast.UAdd(), operand=operand):
            return _eval(operand)
        case ast.BinOp(left=left, op=op, right=right):
            a, b = _eval(left), _eval(right)
            match op:
                case ast.Add():
                    return a + b
                case ast.Sub():
                    return a - b
                case ast.Mult():
                    return a * b
                case ast.Div():
                    if b == 0:
                        raise ExpressionError("Deljenje z 0 ni dovoljeno.")
                    return a / b
    raise ExpressionError("Dovoljeni so le +, -, ·, : in oklepaji.")


def parse_number(text: str) -> Fraction | None:
    """Prebere število, ki ga je vpisal učenec (sprejme tudi decimalno vejico)."""
    cleaned = text.strip().replace(" ", "").replace(",", ".").replace("−", "-")
    if not cleaned:
        return None
    try:
        return Fraction(cleaned)
    except (ValueError, ZeroDivisionError):
        return None


def format_number(value: Fraction | float | int) -> str:
    """Lep izpis števila z decimalno vejico."""
    fraction = Fraction(value).limit_denominator(10_000)
    if fraction.denominator == 1:
        return str(fraction.numerator)
    return f"{float(fraction):g}".replace(".", ",")
