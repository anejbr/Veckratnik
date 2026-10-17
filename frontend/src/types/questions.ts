import type { QuizStatus, QuizTheme } from '@/types/quiz'

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'numeric'
  | 'short_text'
  | 'fill_blank'
  | 'compare'
  | 'ordering'
  | 'matching'
  | 'multiples_grid'
  | 'times_table'
  | 'arithmetic'
  | 'info'

export type Option = { id: string; text: string }

/* ---------- Naloge, kot jih ureja učitelj (z rešitvami) ---------- */

type DraftBase = {
  /** id v bazi (pri urejanju obstoječega kviza) */
  id?: number | null
  prompt: string
  points: number
  hint?: string | null
  explanation?: string | null
  image_url?: string | null
}

export type SingleChoiceDraft = DraftBase & { type: 'single_choice'; options: Option[]; correct: string }
export type MultipleChoiceDraft = DraftBase & { type: 'multiple_choice'; options: Option[]; correct: string[] }
export type TrueFalseDraft = DraftBase & { type: 'true_false'; correct: boolean }
export type NumericDraft = DraftBase & { type: 'numeric'; answer: number; tolerance: number; unit?: string | null }
export type ShortTextDraft = DraftBase & { type: 'short_text'; accepted: string[]; case_sensitive: boolean }
export type FillBlankDraft = DraftBase & { type: 'fill_blank'; template: string; answers: string[] }
export type CompareDraft = DraftBase & { type: 'compare'; left: string; right: string }
export type OrderingDraft = DraftBase & { type: 'ordering'; items: string[]; direction_label: string }
export type MatchingDraft = DraftBase & { type: 'matching'; pairs: { left: string; right: string }[] }
export type MultiplesGridDraft = DraftBase & {
  type: 'multiples_grid'
  mode: 'multiples' | 'divisors'
  number: number
  range_from: number
  range_to: number
}
export type TimesTableDraft = DraftBase & {
  type: 'times_table'
  factors: number[]
  max_multiplier: number
  operation: 'multiply' | 'divide' | 'mixed'
  count: number
}
export type ArithmeticOperation = '+' | '-' | '*' | ':'
export type ArithmeticDraft = DraftBase & {
  type: 'arithmetic'
  operations: ArithmeticOperation[]
  min_value: number
  max_value: number
  count: number
  allow_negative: boolean
}
export type InfoDraft = DraftBase & { type: 'info' }

export type QuestionDraft =
  | SingleChoiceDraft
  | MultipleChoiceDraft
  | TrueFalseDraft
  | NumericDraft
  | ShortTextDraft
  | FillBlankDraft
  | CompareDraft
  | OrderingDraft
  | MatchingDraft
  | MultiplesGridDraft
  | TimesTableDraft
  | ArithmeticDraft
  | InfoDraft

export type DraftOf<T extends QuestionType> = Extract<QuestionDraft, { type: T }>

/* ---------- Naloge, kot jih vidi učenec (brez rešitev) ---------- */

export type Item = { id: string; text: string }

type ViewBase = {
  id: string
  prompt: string
  points: number
  hint: string | null
  image_url: string | null
}

export type QuestionView =
  | (ViewBase & { type: 'single_choice'; options: Option[] })
  | (ViewBase & { type: 'multiple_choice'; options: Option[] })
  | (ViewBase & { type: 'true_false' })
  | (ViewBase & { type: 'numeric'; unit: string | null })
  | (ViewBase & { type: 'short_text' })
  | (ViewBase & { type: 'fill_blank'; template: string })
  | (ViewBase & { type: 'compare'; left: string; right: string })
  | (ViewBase & { type: 'ordering'; items: Item[]; direction_label: string })
  | (ViewBase & { type: 'matching'; left: Item[]; right: Item[] })
  | (ViewBase & { type: 'multiples_grid'; mode: 'multiples' | 'divisors'; number: number; numbers: number[] })
  | (ViewBase & { type: 'times_table' | 'arithmetic'; items: Item[] })
  | (ViewBase & { type: 'info' })

export type ViewOf<T extends QuestionType> = Extract<QuestionView, { type: T }>

export type CompareSign = '<' | '=' | '>'

/** Odgovor učenca za posamezno nalogo */
export type Answer =
  | string
  | string[]
  | boolean
  | number[]
  | Record<string, string>
  | null

export type Answers = Record<string, Answer>

/* ---------- Kviz v sandboxu ---------- */

export type QuizSettings = {
  theme: QuizTheme
  emoji: string
  font_size: 'normal' | 'large'
  layout: 'one_by_one' | 'all_at_once'
  show_timer: boolean
  time_limit_seconds: number | null
  shuffle_questions: boolean
  shuffle_options: boolean
  show_correct_answers: boolean
  max_attempts: number | null
}

export type QuizDraft = {
  title: string
  description: string
  grade: number | null
  status: QuizStatus
  access_code: string | null
  settings: QuizSettings
  tags: string[]
  sources: string[]
  questions: QuestionDraft[]
}

export type TeacherQuizDetail = QuizDraft & {
  id: number
  created_at: string
  updated_at: string
}

export const DEFAULT_SETTINGS: QuizSettings = {
  theme: 'indigo',
  emoji: '🧮',
  font_size: 'normal',
  layout: 'one_by_one',
  show_timer: true,
  time_limit_seconds: null,
  shuffle_questions: false,
  shuffle_options: true,
  show_correct_answers: true,
  max_attempts: null,
}
