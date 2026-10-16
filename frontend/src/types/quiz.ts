export type QuizStatus = 'draft' | 'published'

export type QuizTheme = 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'orange' | 'teal'

export type QuizSummary = {
  id: number
  title: string
  description: string
  grade: number | null
  status: QuizStatus
  tags: string[]
  theme: QuizTheme
  emoji: string
  locked: boolean
  question_count: number
  time_limit_seconds: number | null
  owner_name: string
  created_at: string
  updated_at: string
}

export type QuizPublicDetail = QuizSummary & {
  sources: string[]
  max_attempts: number | null
  show_timer: boolean
  layout: 'one_by_one' | 'all_at_once'
  is_owner: boolean
}

export type Tag = {
  name: string
  quiz_count: number
}
