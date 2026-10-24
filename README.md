# Večkratnik

Spletna aplikacija z matematičnimi kvizi za osnovnošolce. Učenci rešujejo kvize in po oddaji vidijo svoj čas reševanja in rezultat, učitelji pa v sandboxu sestavljajo svoje kvize, jih zaklenejo s kodo in spremljajo statistiko.

| Del | Tehnologije |
|---|---|
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic 2, JWT |
| Frontend | React + TypeScript, Vite, Tailwind CSS 4, shadcn/ui, TanStack Query, dnd-kit, Recharts |
| Baza | PostgreSQL 17 |
| Zagon | Docker Compose (`db`, `backend`, `frontend`) |

## Zagon

Potrebuješ Docker z Docker Compose.

```bash
cp .env.example .env      # po potrebi spremeni gesla, JWT_SECRET in TEACHER_ACCESS_CODE
docker compose up --build
```

- aplikacija: <http://localhost:5173>
- API in dokumentacija (Swagger): <http://localhost:8000/docs>

Ob prvem zagonu se izvedejo migracije in (če je `SEED_DEMO_DATA=true`) baza se napolni z demo podatki.

### Demo računi

| Vloga | Prijava | Geslo | Dodatno |
|---|---|---|---|
| Učitelj | `ucitelj@veckratnik.si` | `ucitelj123` | učiteljska koda iz `.env` (`TEACHER_ACCESS_CODE`, privzeto `UCITELJ-2026`) |
| Učenec | `ucenec` | `ucenec123` | – |

Zaklenjen demo kviz »Preverjanje: poštevanka (3. a)« ima kodo `3A-2026`.

## Funkcionalnosti

**Prijava** – ločeni strani za učence (uporabniško ime) in učitelje (e-naslov). Učitelj mora ob registraciji **in ob vsaki prijavi** vpisati učiteljsko kodo iz `.env`.

**Učenci**
- seznam vseh objavljenih kvizov z iskanjem ter filtri po tagih in razredu
- reševanje »ena po ena« ali »vse naenkrat«, napredek, štoparica ali odštevanje časa (samodejna oddaja)
- po oddaji: čas reševanja, točke, primerjava s prejšnjim najboljšim poskusom in pregled odgovorov
- stran »Moji rezultati«

**Učitelji – sandbox**
- paleta elementov (klik ali povleci na platno), premikanje, podvajanje in brisanje nalog
- vrste nalog: izbira enega / več odgovorov, drži–ne drži, številski odgovor, kratek odgovor, dopolnjevanje, primerjava (<, =, >), razvrščanje, povezovanje parov, mreža večkratnikov/deliteljev, generator poštevanke, generator računov, besedilo/slika
- videz (barvna tema, sličica, velikost pisave, način prikaza), tagi, razred, viri
- pravila: časovna omejitev, mešanje nalog in možnosti, prikaz rešitev, omejitev poskusov
- zaklep s kodo, objava/osnutek, predogled
- statistika: povprečen rezultat in čas, porazdelitev, uspešnost po nalogah, kdo je reševal, odgovori posameznega poskusa, izvoz CSV

## Viri

Demo kvizi in zasnova reševanja temeljijo na virih, navedenih na strani **Viri** v aplikaciji (`frontend/src/lib/sources.ts`, `backend/app/seed/data.py`):

1. Žakelj, A. idr. (2011). *Učni načrt. Program osnovna šola. Matematika.* Ljubljana: MŠŠ, ZRSŠ.
2. Miholič, T. (2018). O poštevanki. *Matematika v šoli*, 24(1), 14–20.
3. Odredba o spremembah in dopolnitvah vzgojno-izobraževalnega programa osnovna šola (2025). *Uradni list RS*.
4. Ministrstvo za vzgojo in izobraževanje (2024). Zapisnik 9. seje, 25. 4. 2024.
5. Sailer, M. in Homner, L. (2020). The Gamification of Learning: a Meta-analysis. *Educational Psychology Review*, 32, 77–112.
6. Ophuis-Cox, F. H., Catrysse, L. in Camp, G. (2023). The effect of retrieval practice on fluently retrieving multiplication facts in an authentic elementary school setting. *Applied Cognitive Psychology*, 37(6), 1463–1469.
7. Deci, E. L., Koestner, R. in Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. *Psychological Bulletin*, 125(6), 627–668.
8. Schwaber, K. in Sutherland, J. (2020). *The Scrum Guide.*

## Struktura

```
backend/
  app/
    api/routes/     auth, quizzes, teacher (CRUD, statistika, CSV), attempts
    models/         User, Quiz, Tag, Question, Attempt
    schemas/        Pydantic sheme (vrste nalog, kviz, poskus, statistika)
    services/       generatorji, ocenjevanje, skrivanje rešitev, statistika
    seed/           demo podatki
  alembic/          migracije
  tests/            pytest
frontend/
  src/
    components/     builder (sandbox), questions (prikaz nalog), player, stats, ui (shadcn)
    pages/          prijava, kvizi, reševanje, rezultati, učitelj, viri
    lib/            API odjemalec, teme, katalog nalog, viri
docker-compose.yml
.env.example
```

## Razvoj

```bash
docker compose exec backend pytest -q              # testi backenda
docker compose exec frontend npm run build         # preverjanje tipov in build
docker compose exec frontend npm run lint
docker compose exec backend alembic revision --autogenerate -m "opis"   # nova migracija
```

Backend in frontend tečeta z vročim osveževanjem (mapi sta priklopljeni kot volumna). Nove npm pakete frontend container namesti ob ponovnem zagonu.

Ponastavitev baze (izbriše vse podatke):

```bash
docker compose down -v && docker compose up --build
```

## Ekipa

jakobrencelj, aneimarkovic, Tom Li Dobnik in anejbr.
