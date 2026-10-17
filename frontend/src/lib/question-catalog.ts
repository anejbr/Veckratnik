import {
  ArrowDownUp,
  Asterisk,
  Calculator,
  CircleDot,
  Grid3x3,
  Hash,
  Link2,
  ListChecks,
  Scale,
  StickyNote,
  TextCursorInput,
  ToggleLeft,
  Type,
  type LucideIcon,
} from 'lucide-react'

import type { DraftOf, QuestionDraft, QuestionType } from '@/types/questions'

export type CatalogGroup = 'Izbira' | 'Vpis odgovora' | 'Števila' | 'Generatorji' | 'Ostalo'

type CatalogEntry<T extends QuestionType = QuestionType> = {
  type: T
  label: string
  description: string
  icon: LucideIcon
  group: CatalogGroup
  /** barva ikone v paleti */
  tone: string
  create: () => DraftOf<T>
}

const optionId = (index: number) => String.fromCharCode(97 + index) // a, b, c …

function entry<T extends QuestionType>(value: CatalogEntry<T>): CatalogEntry<T> {
  return value
}

export const QUESTION_CATALOG = {
  single_choice: entry({
    type: 'single_choice',
    label: 'Izbira enega odgovora',
    description: 'Ena pravilna možnost',
    icon: CircleDot,
    group: 'Izbira',
    tone: 'bg-indigo-100 text-indigo-700',
    create: () => ({
      type: 'single_choice',
      prompt: 'Koliko je 6 · 7?',
      points: 1,
      options: ['42', '36', '48'].map((text, i) => ({ id: optionId(i), text })),
      correct: 'a',
    }),
  }),
  multiple_choice: entry({
    type: 'multiple_choice',
    label: 'Več pravilnih odgovorov',
    description: 'Učenec označi vse pravilne',
    icon: ListChecks,
    group: 'Izbira',
    tone: 'bg-violet-100 text-violet-700',
    create: () => ({
      type: 'multiple_choice',
      prompt: 'Katera števila so večkratniki števila 4?',
      points: 2,
      options: ['8', '10', '16', '18'].map((text, i) => ({ id: optionId(i), text })),
      correct: ['a', 'c'],
    }),
  }),
  true_false: entry({
    type: 'true_false',
    label: 'Drži / ne drži',
    description: 'Trditev, ki je pravilna ali napačna',
    icon: ToggleLeft,
    group: 'Izbira',
    tone: 'bg-sky-100 text-sky-700',
    create: () => ({ type: 'true_false', prompt: '9 · 0 = 9', points: 1, correct: false }),
  }),
  numeric: entry({
    type: 'numeric',
    label: 'Številski odgovor',
    description: 'Račun ali besedilna naloga',
    icon: Hash,
    group: 'Vpis odgovora',
    tone: 'bg-emerald-100 text-emerald-700',
    create: () => ({
      type: 'numeric',
      prompt: 'Maja ima 4 škatle. V vsaki je 6 bonbonov. Koliko bonbonov ima Maja?',
      points: 2,
      answer: 24,
      tolerance: 0,
      unit: 'bonbonov',
    }),
  }),
  short_text: entry({
    type: 'short_text',
    label: 'Kratek odgovor',
    description: 'Beseda ali kratko besedilo',
    icon: Type,
    group: 'Vpis odgovora',
    tone: 'bg-teal-100 text-teal-700',
    create: () => ({
      type: 'short_text',
      prompt: 'Kako imenujemo rezultat množenja?',
      points: 1,
      accepted: ['zmnožek', 'produkt'],
      case_sensitive: false,
    }),
  }),
  fill_blank: entry({
    type: 'fill_blank',
    label: 'Dopolni manjkajoče',
    description: 'Prazna mesta v računu',
    icon: TextCursorInput,
    group: 'Vpis odgovora',
    tone: 'bg-cyan-100 text-cyan-700',
    create: () => ({
      type: 'fill_blank',
      prompt: 'Dopolni račun.',
      points: 1,
      template: '7 · {} = 56',
      answers: ['8'],
    }),
  }),
  compare: entry({
    type: 'compare',
    label: 'Primerjaj (<, =, >)',
    description: 'Kateri izraz je večji?',
    icon: Scale,
    group: 'Števila',
    tone: 'bg-amber-100 text-amber-800',
    create: () => ({ type: 'compare', prompt: 'Vstavi znak <, = ali >.', points: 1, left: '3 · 8', right: '4 · 6' }),
  }),
  ordering: entry({
    type: 'ordering',
    label: 'Razvrsti po vrsti',
    description: 'Uredi števila ali izraze',
    icon: ArrowDownUp,
    group: 'Števila',
    tone: 'bg-orange-100 text-orange-700',
    create: () => ({
      type: 'ordering',
      prompt: 'Razvrsti zmnožke.',
      points: 2,
      items: ['2 · 3', '3 · 4', '5 · 5', '6 · 7'],
      direction_label: 'od najmanjšega do največjega',
    }),
  }),
  matching: entry({
    type: 'matching',
    label: 'Poveži pare',
    description: 'Račun ↔ rezultat',
    icon: Link2,
    group: 'Števila',
    tone: 'bg-rose-100 text-rose-700',
    create: () => ({
      type: 'matching',
      prompt: 'Poveži račun z rezultatom.',
      points: 3,
      pairs: [
        { left: '4 · 5', right: '20' },
        { left: '3 · 9', right: '27' },
        { left: '8 · 7', right: '56' },
      ],
    }),
  }),
  multiples_grid: entry({
    type: 'multiples_grid',
    label: 'Mreža večkratnikov',
    description: 'Označi večkratnike ali delitelje',
    icon: Grid3x3,
    group: 'Števila',
    tone: 'bg-fuchsia-100 text-fuchsia-700',
    create: () => ({
      type: 'multiples_grid',
      prompt: 'Označi vse večkratnike števila 3.',
      points: 3,
      mode: 'multiples',
      number: 3,
      range_from: 1,
      range_to: 30,
    }),
  }),
  times_table: entry({
    type: 'times_table',
    label: 'Poštevanka (generator)',
    description: 'Novi računi ob vsakem reševanju',
    icon: Asterisk,
    group: 'Generatorji',
    tone: 'bg-primary/15 text-primary',
    create: () => ({
      type: 'times_table',
      prompt: 'Izračunaj čim hitreje.',
      points: 1,
      factors: [2, 5, 10],
      max_multiplier: 10,
      operation: 'multiply',
      count: 10,
    }),
  }),
  arithmetic: entry({
    type: 'arithmetic',
    label: 'Računi (generator)',
    description: 'Seštevanje, odštevanje, množenje, deljenje',
    icon: Calculator,
    group: 'Generatorji',
    tone: 'bg-lime-100 text-lime-700',
    create: () => ({
      type: 'arithmetic',
      prompt: 'Izračunaj.',
      points: 1,
      operations: ['+', '-'],
      min_value: 0,
      max_value: 20,
      count: 10,
      allow_negative: false,
    }),
  }),
  info: entry({
    type: 'info',
    label: 'Besedilo / slika',
    description: 'Uvod ali razlaga brez točk',
    icon: StickyNote,
    group: 'Ostalo',
    tone: 'bg-slate-100 text-slate-700',
    create: () => ({ type: 'info', prompt: 'Preden začneš: pozorno preberi vsako nalogo. 🙂', points: 0 }),
  }),
} satisfies { [T in QuestionType]: CatalogEntry<T> }

export const CATALOG_GROUPS: CatalogGroup[] = ['Izbira', 'Vpis odgovora', 'Števila', 'Generatorji', 'Ostalo']

export const catalogEntry = (type: QuestionType): CatalogEntry => QUESTION_CATALOG[type] as CatalogEntry

export const createQuestion = (type: QuestionType): QuestionDraft => QUESTION_CATALOG[type].create()

export const isGenerator = (type: QuestionType) => type === 'times_table' || type === 'arithmetic'

/** Največ točk, ki jih naloga prinese (generator: točke × število računov) */
export function maxPoints(question: QuestionDraft): number {
  if (question.type === 'info') return 0
  if (question.type === 'times_table' || question.type === 'arithmetic') return question.points * question.count
  return question.points
}

export const OPERATION_SYMBOLS: Record<string, string> = { '+': '+', '-': '−', '*': '·', ':': ':' }
