import type { QuestionType, QuestionView } from '@/types/questions'
import type { QuizTheme } from '@/types/quiz'

export type AttemptView = {
  id: number
  quiz_id: number
  quiz_title: string
  theme: QuizTheme
  emoji: string
  font_size: 'normal' | 'large'
  layout: 'one_by_one' | 'all_at_once'
  show_timer: boolean
  time_limit_seconds: number | null
  started_at: string
  server_time: string
  questions: QuestionView[]
}

export type ResultItem = {
  text: string
  given: string
  expected: string | null
  correct: boolean
}

export type QuestionResult = {
  id: string
  question_id: number | null
  type: QuestionType
  prompt: string
  explanation: string | null
  earned: number
  max: number
  correct: boolean
  given: string
  expected: string | null
  items?: ResultItem[]
}

export type AttemptResult = {
  id: number
  quiz_id: number
  quiz_title: string
  theme: QuizTheme
  emoji: string
  student_name: string
  started_at: string
  finished_at: string
  duration_seconds: number
  score: number
  max_score: number
  percent: number
  timed_out: boolean
  attempt_number: number
  show_correct_answers: boolean
  previous_best: { percent: number; duration_seconds: number | null } | null
  results: QuestionResult[]
}

export type MyAttempt = {
  id: number
  quiz_id: number
  quiz_title: string
  theme: QuizTheme
  emoji: string
  finished_at: string
  duration_seconds: number
  score: number
  max_score: number
  percent: number
}

export const isResult = (value: AttemptView | AttemptResult): value is AttemptResult => 'results' in value
