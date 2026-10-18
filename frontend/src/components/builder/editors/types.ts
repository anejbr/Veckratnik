import type { DraftOf, QuestionType } from '@/types/questions'

export type EditorProps<T extends QuestionType> = {
  question: DraftOf<T>
  onChange: (question: DraftOf<T>) => void
}
