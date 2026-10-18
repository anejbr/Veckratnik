import { useCallback, useMemo, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

import { createQuestion } from '@/lib/question-catalog'
import {
  DEFAULT_SETTINGS,
  type QuestionDraft,
  type QuestionType,
  type QuizDraft,
  type QuizSettings,
  type TeacherQuizDetail,
} from '@/types/questions'

/** Naloga v sandboxu ima še lokalni ključ (za premikanje in izbiro). */
export type BuilderQuestion = QuestionDraft & { key: string }
export type BuilderState = Omit<QuizDraft, 'questions'> & { questions: BuilderQuestion[] }

const newKey = () => crypto.randomUUID()

export const EMPTY_QUIZ: QuizDraft = {
  title: '',
  description: '',
  grade: null,
  status: 'draft',
  access_code: null,
  settings: DEFAULT_SETTINGS,
  tags: [],
  sources: [],
  questions: [],
}

function toBuilderState(quiz: QuizDraft | TeacherQuizDetail): BuilderState {
  return {
    title: quiz.title,
    description: quiz.description,
    grade: quiz.grade,
    status: quiz.status,
    access_code: quiz.access_code,
    settings: { ...DEFAULT_SETTINGS, ...quiz.settings },
    tags: quiz.tags,
    sources: quiz.sources,
    questions: quiz.questions.map((q) => ({ ...q, key: newKey() })),
  }
}

export function toPayload(state: BuilderState): QuizDraft {
  return {
    ...state,
    title: state.title.trim(),
    access_code: state.access_code?.trim() || null,
    questions: state.questions.map(({ key: _key, ...question }) => question as QuestionDraft),
  }
}

export function useQuizDraft(initial: QuizDraft | TeacherQuizDetail) {
  const [state, setState] = useState<BuilderState>(() => toBuilderState(initial))
  const [selectedKey, setSelectedKey] = useState<string | null>(() => state.questions[0]?.key ?? null)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(toPayload(state)))
  const dirty = useMemo(() => JSON.stringify(toPayload(state)) !== savedSnapshot, [state, savedSnapshot])

  const update = useCallback(<K extends keyof BuilderState>(field: K, value: BuilderState[K]) => {
    setState((s) => ({ ...s, [field]: value }))
  }, [])

  const updateSettings = useCallback((patch: Partial<QuizSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const addQuestion = useCallback((type: QuestionType, index?: number) => {
    const question: BuilderQuestion = { ...createQuestion(type), key: newKey() }
    setState((s) => {
      const questions = [...s.questions]
      questions.splice(index ?? questions.length, 0, question)
      return { ...s, questions }
    })
    setSelectedKey(question.key)
  }, [])

  const updateQuestion = useCallback((key: string, question: QuestionDraft) => {
    setState((s) => ({ ...s, questions: s.questions.map((q) => (q.key === key ? { ...question, key } : q)) }))
  }, [])

  const removeQuestion = useCallback(
    (key: string) => {
      const index = state.questions.findIndex((q) => q.key === key)
      const remaining = state.questions.filter((q) => q.key !== key)
      setState((s) => ({ ...s, questions: s.questions.filter((q) => q.key !== key) }))
      if (selectedKey === key) setSelectedKey(remaining[Math.min(index, remaining.length - 1)]?.key ?? null)
    },
    [state.questions, selectedKey],
  )

  const duplicateQuestion = useCallback((key: string) => {
    const copyKey = newKey()
    setState((s) => {
      const index = s.questions.findIndex((q) => q.key === key)
      if (index < 0) return s
      const copy = { ...structuredClone(s.questions[index]), id: null, key: copyKey }
      const questions = [...s.questions]
      questions.splice(index + 1, 0, copy)
      return { ...s, questions }
    })
    setSelectedKey(copyKey)
  }, [])

  const moveQuestion = useCallback((from: number, to: number) => {
    setState((s) => ({ ...s, questions: arrayMove(s.questions, from, to) }))
  }, [])

  /** Po shranjevanju prevzame id-je nalog s strežnika in ponastavi stanje »neshranjeno«. */
  const markSaved = useCallback((saved: TeacherQuizDetail, sent: QuizDraft) => {
    const withIds = <T extends { id?: number | null }>(questions: T[]) =>
      questions.map((q, i) => ({ ...q, id: saved.questions[i]?.id ?? q.id }))
    setSavedSnapshot(
      JSON.stringify({ ...sent, access_code: saved.access_code, tags: saved.tags, questions: withIds(sent.questions) }),
    )
    setState((s) => ({ ...s, access_code: saved.access_code, tags: saved.tags, questions: withIds(s.questions) }))
  }, [])

  return {
    state,
    dirty,
    selectedKey,
    setSelectedKey,
    update,
    updateSettings,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicateQuestion,
    moveQuestion,
    markSaved,
  }
}

export type QuizDraftApi = ReturnType<typeof useQuizDraft>
