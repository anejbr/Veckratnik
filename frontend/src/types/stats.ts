import type { QuestionType } from '@/types/questions'
import type { QuizTheme } from '@/types/quiz'

export type QuizStats = {
  quiz_id: number
  title: string
  theme: QuizTheme
  emoji: string
  status: 'draft' | 'published'
  access_code: string | null
  summary: {
    attempts: number
    students: number
    average_percent: number | null
    average_seconds: number | null
    best_percent: number | null
    fastest_seconds: number | null
    perfect_count: number
  }
  distribution: { label: string; count: number }[]
  questions: {
    question_id: number | null
    position: number
    label: string
    type: QuestionType
    answered: number
    success_rate: number | null
    average_percent: number | null
  }[]
  by_day: { day: string; count: number }[]
  attempts: {
    id: number
    student_id: number
    student_name: string
    username: string
    grade: number | null
    score: number
    max_score: number
    percent: number
    duration_seconds: number
    finished_at: string
    timed_out: boolean
    attempt_number: number
  }[]
  students: {
    student_id: number
    student_name: string
    grade: number | null
    attempts: number
    best_percent: number
    best_seconds: number | null
    average_seconds: number
    last_finished_at: string
  }[]
}
