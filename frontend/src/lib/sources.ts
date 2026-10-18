/** Viri, na katerih temeljijo naloge in zasnova aplikacije. */
export type Source = {
  id: string
  citation: string
  /** kratka oznaka za izbiro v sandboxu */
  short: string
  /** kako je vir uporabljen v aplikaciji */
  usage: string
  forTasks: boolean
}

export const SOURCES: Source[] = [
  {
    id: 'un-2011',
    citation:
      'Žakelj, A. idr. (2011). Učni načrt. Program osnovna šola. Matematika. Ljubljana: Ministrstvo za šolstvo in šport, Zavod RS za šolstvo.',
    short: 'Učni načrt za matematiko (2011)',
    usage: 'Vsebine in razredi demo kvizov (poštevanka, večkratniki in delitelji, računske operacije, besedilne naloge).',
    forTasks: true,
  },
  {
    id: 'miholic-2018',
    citation: 'Miholič, T. (2018). O poštevanki. Matematika v šoli, 24(1), 14–20.',
    short: 'Miholič – O poštevanki (2018)',
    usage: 'Postopno učenje poštevanke po skupinah števil (2, 5, 10 → 3, 4, 6 → 7, 8, 9) in povezava množenja z deljenjem.',
    forTasks: true,
  },
  {
    id: 'odredba-2025',
    citation:
      'Odredba o spremembah in dopolnitvah vzgojno-izobraževalnega programa osnovna šola (2025). Uradni list RS.',
    short: 'Odredba o spremembah programa OŠ (2025)',
    usage: 'Okvir za usklajevanje vsebin kvizov s prenovljenim programom osnovne šole.',
    forTasks: true,
  },
  {
    id: 'mvi-2024',
    citation: 'Ministrstvo za vzgojo in izobraževanje (2024). Zapisnik 9. seje, 25. 4. 2024.',
    short: 'MVI – zapisnik 9. seje (2024)',
    usage: 'Ozadje prenove učnih načrtov.',
    forTasks: true,
  },
  {
    id: 'sailer-2020',
    citation:
      'Sailer, M. in Homner, L. (2020). The Gamification of Learning: a Meta-analysis. Educational Psychology Review, 32, 77–112.',
    short: 'Sailer in Homner – gamifikacija (2020)',
    usage: 'Elementi igrifikacije: barvne teme, napredek med reševanjem, takojšnja povratna informacija in pregled rezultatov.',
    forTasks: true,
  },
  {
    id: 'ophuis-cox-2023',
    citation:
      'Ophuis-Cox, F. H., Catrysse, L. in Camp, G. (2023). The effect of retrieval practice on fluently retrieving multiplication facts in an authentic elementary school setting. Applied Cognitive Psychology, 37(6), 1463–1469.',
    short: 'Ophuis-Cox idr. – priklic poštevanke (2023)',
    usage: 'Generator poštevanke z novimi računi ob vsakem poskusu in merjenje časa – vaja priklica za tekoče znanje poštevanke.',
    forTasks: true,
  },
  {
    id: 'deci-1999',
    citation:
      'Deci, E. L., Koestner, R. in Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. Psychological Bulletin, 125(6), 627–668.',
    short: 'Deci idr. – zunanje nagrade (1999)',
    usage: 'Brez javnih lestvic in nagrad – učenec primerja le svoje rezultate in čas s prejšnjimi poskusi.',
    forTasks: true,
  },
  {
    id: 'scrum-2020',
    citation: 'Schwaber, K. in Sutherland, J. (2020). The Scrum Guide.',
    short: 'Scrum Guide (2020)',
    usage: 'Način timskega dela pri razvoju aplikacije (sprinti, razdelitev nalog med člane ekipe).',
    forTasks: false,
  },
]
