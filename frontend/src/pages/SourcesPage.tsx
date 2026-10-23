import { BookOpen, Brain, Clock, Hammer, Sparkles, UserRound } from 'lucide-react'

import { SOURCES, type Source } from '@/lib/sources'

const GROUPS: { id: Source['group']; title: string; text: string }[] = [
  {
    id: 'vsebina',
    title: 'Vsebina nalog',
    text: 'Iz kurikularnih dokumentov in strokovne literature izhajajo teme, razredi in vrstni red učenja.',
  },
  {
    id: 'didaktika',
    title: 'Zasnova reševanja',
    text: 'Raziskave o vaji priklica, igrifikaciji in motivaciji so vplivale na to, kako kvizi delujejo.',
  },
  { id: 'razvoj', title: 'Razvoj aplikacije', text: 'Kako smo kot ekipa načrtovali in razvijali Večkratnik.' },
]

const PRINCIPLES = [
  {
    icon: Brain,
    title: 'Vaja priklica',
    text: 'Generator poštevanke ob vsakem poskusu ustvari nove račune, zato je to res vaja priklica iz spomina in ne pomnjenje odgovorov na pamet.',
  },
  {
    icon: Clock,
    title: 'Merjenje časa',
    text: 'Čas reševanja se vedno zabeleži. Učenec po oddaji vidi svoj čas in ga lahko izboljšuje – cilj je tekoče znanje poštevanke.',
  },
  {
    icon: Sparkles,
    title: 'Igrifikacija z mero',
    text: 'Barve, sličice, napredek in takojšnja povratna informacija naredijo reševanje privlačnejše.',
  },
  {
    icon: UserRound,
    title: 'Brez lestvic in nagrad',
    text: 'Ni javnih lestvic ali točk za nagrade. Učenec primerja le svoje rezultate s prejšnjimi poskusi, kar ohranja notranjo motivacijo.',
  },
]

export function SourcesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight">
          <BookOpen className="size-7 text-primary" /> Viri
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Naloge v demo kvizih in način delovanja aplikacije temeljijo na spodnjih virih. Učitelji lahko vire dodajo
          tudi k svojim kvizom – učenci jih vidijo na strani kviza.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">Načela, ki jih upoštevamo</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-2xl border bg-card p-4">
              <p className="flex items-center gap-2 font-bold">
                <principle.icon className="size-5 text-primary" /> {principle.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{principle.text}</p>
            </div>
          ))}
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.id} className="space-y-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              {group.id === 'razvoj' && <Hammer className="size-5" />}
              {group.title}
            </h2>
            <p className="text-sm text-muted-foreground">{group.text}</p>
          </div>
          <ol className="space-y-3">
            {SOURCES.filter((source) => source.group === group.id).map((source) => (
              <li key={source.id} className="rounded-2xl border bg-card p-4">
                <p className="font-semibold">{source.citation}</p>
                <p className="mt-2 rounded-lg bg-muted/70 px-3 py-2 text-sm">
                  <span className="font-bold">V aplikaciji: </span>
                  {source.usage}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
