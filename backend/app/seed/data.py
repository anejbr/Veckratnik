"""Demo kvizi. Vsebine in razredi so usklajeni z učnim načrtom (okvirno – preveri po UN)."""

from typing import Any

SOURCES = {
    "un": "Žakelj, A. idr. (2011). Učni načrt. Program osnovna šola. Matematika. Ljubljana: Ministrstvo za šolstvo in šport, Zavod RS za šolstvo.",
    "miholic": "Miholič, T. (2018). O poštevanki. Matematika v šoli, 24(1), 14–20.",
    "odredba": "Odredba o spremembah in dopolnitvah vzgojno-izobraževalnega programa osnovna šola (2025). Uradni list RS.",
    "sailer": "Sailer, M. in Homner, L. (2020). The Gamification of Learning: a Meta-analysis. Educational Psychology Review, 32, 77–112.",
    "ophuis": "Ophuis-Cox, F. H., Catrysse, L. in Camp, G. (2023). The effect of retrieval practice on fluently retrieving multiplication facts in an authentic elementary school setting. Applied Cognitive Psychology, 37(6), 1463–1469.",
    "deci": "Deci, E. L., Koestner, R. in Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. Psychological Bulletin, 125(6), 627–668.",
}


def opts(*texts: str) -> list[dict[str, str]]:
    return [{"id": chr(97 + i), "text": text} for i, text in enumerate(texts)]


QUIZZES: list[dict[str, Any]] = [
    {
        "title": "Poštevanka števil 2, 5 in 10",
        "description": "Prvi koraki pri poštevanki: števila 2, 5 in 10 so najlažja, ker jih poznamo iz štetja po dva, po pet in po deset.",
        "grade": 2,
        "tags": ["poštevanka", "množenje", "2. razred"],
        "settings": {"theme": "emerald", "emoji": "🐸", "font_size": "large"},
        "sources": [SOURCES["un"], SOURCES["miholic"]],
        "questions": [
            {"type": "info", "prompt": "Preden začneš: pri poštevanki števila 10 je rezultat vedno število z ničlo na koncu. 🙂"},
            {"type": "times_table", "prompt": "Izračunaj.", "points": 1, "factors": [2, 5, 10], "max_multiplier": 10, "operation": "multiply", "count": 10},
            {"type": "fill_blank", "prompt": "Dopolni račun.", "template": "5 · {} = 35", "answers": ["7"]},
            {"type": "true_false", "prompt": "10 · 6 = 60", "correct": True},
            {"type": "true_false", "prompt": "2 · 9 = 19", "correct": False, "explanation": "2 · 9 = 18, ker je 9 + 9 = 18."},
            {
                "type": "matching",
                "prompt": "Poveži račun z rezultatom.",
                "points": 3,
                "pairs": [{"left": "2 · 4", "right": "8"}, {"left": "5 · 3", "right": "15"}, {"left": "10 · 7", "right": "70"}],
            },
        ],
    },
    {
        "title": "Poštevanka 3, 4 in 6",
        "description": "Poštevanka števil 3, 4 in 6 z množenjem in deljenjem. Spomni se: 6 · 4 je dvakrat toliko kot 3 · 4.",
        "grade": 3,
        "tags": ["poštevanka", "deljenje", "3. razred"],
        "settings": {"theme": "sky", "emoji": "🐼", "shuffle_questions": False},
        "sources": [SOURCES["un"], SOURCES["miholic"]],
        "questions": [
            {"type": "times_table", "prompt": "Množenje in deljenje", "points": 1, "factors": [3, 4, 6], "max_multiplier": 10, "operation": "mixed", "count": 12},
            {"type": "multiple_choice", "prompt": "Kateri zmnožki so enaki 24?", "points": 2, "options": opts("4 · 6", "3 · 8", "4 · 5", "6 · 3"), "correct": ["a", "b"]},
            {"type": "compare", "prompt": "Vstavi znak <, = ali >.", "left": "6 · 7", "right": "4 · 10"},
            {"type": "compare", "prompt": "Vstavi znak <, = ali >.", "left": "3 · 8", "right": "4 · 6"},
            {"type": "ordering", "prompt": "Razvrsti zmnožke.", "points": 2, "items": ["3 · 3", "4 · 4", "6 · 3", "4 · 6", "6 · 6"], "direction_label": "od najmanjšega do največjega"},
            {"type": "single_choice", "prompt": "Koliko je 36 : 6?", "options": opts("5", "6", "7", "9"), "correct": "b", "hint": "Pomisli: 6 · ? = 36"},
        ],
    },
    {
        "title": "Hitri izziv: vsa poštevanka",
        "description": "Vaja priklica: ob vsakem poskusu dobiš nove račune. Poskusi izboljšati svoj čas – primerjaš se le s svojimi prejšnjimi poskusi.",
        "grade": 4,
        "tags": ["poštevanka", "hitrost", "ponavljanje"],
        "settings": {"theme": "orange", "emoji": "🚀", "time_limit_seconds": 240, "layout": "all_at_once"},
        "sources": [SOURCES["ophuis"], SOURCES["miholic"], SOURCES["deci"]],
        "questions": [
            {"type": "times_table", "prompt": "Reši čim več računov, preden poteče čas!", "points": 1, "factors": [2, 3, 4, 5, 6, 7, 8, 9, 10], "max_multiplier": 10, "operation": "multiply", "count": 30},
        ],
    },
    {
        "title": "Večkratniki in delitelji",
        "description": "Kaj je večkratnik in kaj delitelj? Poišči jih v mreži števil in reši nekaj nalog o skupnih večkratnikih.",
        "grade": 5,
        "tags": ["večkratniki", "delitelji", "5. razred"],
        "settings": {"theme": "violet", "emoji": "🧩"},
        "sources": [SOURCES["un"]],
        "questions": [
            {"type": "multiples_grid", "prompt": "Označi vse večkratnike števila 6.", "points": 3, "mode": "multiples", "number": 6, "range_from": 1, "range_to": 60},
            {"type": "multiples_grid", "prompt": "Označi vse delitelje števila 24.", "points": 3, "mode": "divisors", "number": 24, "range_from": 1, "range_to": 24},
            {"type": "single_choice", "prompt": "Kateri je najmanjši skupni večkratnik števil 4 in 6?", "options": opts("10", "12", "24", "2"), "correct": "b"},
            {"type": "numeric", "prompt": "Kateri je največji skupni delitelj števil 12 in 18?", "answer": 6, "points": 2},
            {"type": "true_false", "prompt": "Vsako naravno število je večkratnik števila 1.", "correct": True},
            {"type": "short_text", "prompt": "Kako imenujemo število, ki ima natanko dva delitelja?", "accepted": ["praštevilo"], "points": 2},
        ],
    },
    {
        "title": "Deljenje in ostanek",
        "description": "Deljenje kot obratna operacija množenja in deljenje z ostankom.",
        "grade": 4,
        "tags": ["deljenje", "4. razred"],
        "settings": {"theme": "teal", "emoji": "🍕"},
        "sources": [SOURCES["un"], SOURCES["miholic"]],
        "questions": [
            {"type": "arithmetic", "prompt": "Izračunaj količnike.", "points": 1, "operations": [":"], "min_value": 2, "max_value": 10, "count": 8},
            {"type": "fill_blank", "prompt": "Dopolni.", "template": "{} : 7 = 6", "answers": ["42"]},
            {"type": "numeric", "prompt": "24 učencev se razdeli v skupine po 4. Koliko je skupin?", "answer": 6, "unit": "skupin", "points": 2},
            {"type": "fill_blank", "prompt": "Deljenje z ostankom: 29 : 4", "template": "29 : 4 = {} ost. {}", "answers": ["7", "1"], "points": 2},
            {"type": "short_text", "prompt": "Kako imenujemo rezultat deljenja?", "accepted": ["količnik"]},
        ],
    },
    {
        "title": "Besedilne naloge z množenjem",
        "description": "Preberi nalogo, poišči podatke in zapiši račun.",
        "grade": 3,
        "tags": ["besedilne naloge", "množenje", "3. razred"],
        "settings": {"theme": "amber", "emoji": "🍎", "font_size": "large"},
        "sources": [SOURCES["un"]],
        "questions": [
            {"type": "info", "prompt": "Nasvet: najprej podčrtaj števila v nalogi, nato premisli, ali jih moraš množiti ali deliti."},
            {"type": "numeric", "prompt": "Maja ima 4 škatle. V vsaki so 3 jabolka. Koliko jabolk ima Maja?", "answer": 12, "unit": "jabolk", "points": 2},
            {"type": "numeric", "prompt": "Trikolo ima 3 kolesa. Koliko koles ima 5 trikoles?", "answer": 15, "points": 2, "hint": "5 · 3"},
            {"type": "numeric", "prompt": "En sladoled stane 2 €. Koliko stane 6 sladoledov?", "answer": 12, "unit": "€", "points": 2},
            {"type": "single_choice", "prompt": "V razredu je 5 vrst po 4 klopi. Kateri račun pove, koliko je klopi?", "options": opts("5 + 4", "5 · 4", "5 − 4", "20 : 4"), "correct": "b"},
        ],
    },
    {
        "title": "Računamo do 100",
        "description": "Seštevanje in odštevanje v množici naravnih števil do 100.",
        "grade": 2,
        "tags": ["seštevanje", "odštevanje", "2. razred"],
        "settings": {"theme": "rose", "emoji": "🎈", "font_size": "large"},
        "sources": [SOURCES["un"], SOURCES["sailer"]],
        "questions": [
            {"type": "arithmetic", "prompt": "Izračunaj.", "points": 1, "operations": ["+", "-"], "min_value": 0, "max_value": 50, "count": 10},
            {"type": "compare", "prompt": "Vstavi znak <, = ali >.", "left": "45 + 30", "right": "80"},
            {"type": "ordering", "prompt": "Razvrsti števila.", "items": ["19", "37", "61", "73", "98"], "direction_label": "od najmanjšega do največjega"},
        ],
    },
    {
        "title": "Preverjanje: poštevanka (3. a)",
        "description": "Kratko preverjanje poštevanke za 3. a. Koda je na tabli. Imaš dva poskusa.",
        "grade": 3,
        "tags": ["poštevanka", "preverjanje", "3. razred"],
        "access_code": "3A-2026",
        "settings": {"theme": "indigo", "emoji": "🏆", "max_attempts": 2, "show_correct_answers": False, "time_limit_seconds": 600},
        "sources": [SOURCES["un"], SOURCES["miholic"]],
        "questions": [
            {"type": "times_table", "prompt": "Množenje", "points": 1, "factors": [6, 7, 8, 9], "max_multiplier": 10, "operation": "multiply", "count": 10},
            {"type": "times_table", "prompt": "Deljenje", "points": 1, "factors": [6, 7, 8, 9], "max_multiplier": 10, "operation": "divide", "count": 5},
            {"type": "fill_blank", "prompt": "Dopolni.", "template": "{} · 8 = 56", "answers": ["7"]},
        ],
    },
]
