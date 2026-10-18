import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'

import { QuizBuilder } from '@/components/builder/QuizBuilder'
import { EMPTY_QUIZ } from '@/components/builder/useQuizDraft'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import type { TeacherQuizDetail } from '@/types/questions'

export function QuizBuilderPage() {
  const { quizId } = useParams()
  const id = quizId ? Number(quizId) : undefined

  const quiz = useQuery({
    queryKey: ['teacher', 'quiz', id],
    queryFn: () => api<TeacherQuizDetail>(`/teacher/quizzes/${id}`),
    enabled: id !== undefined,
    staleTime: Infinity,
  })

  if (id === undefined) return <QuizBuilder key="nov" initial={EMPTY_QUIZ} />
  if (quiz.isPending) return <Skeleton className="h-[32rem] rounded-3xl" />
  if (quiz.isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold">{errorMessage(quiz.error)}</p>
        <Button asChild variant="link">
          <Link to="/ucitelj/kvizi">Nazaj na moje kvize</Link>
        </Button>
      </div>
    )
  }
  return <QuizBuilder key={id} quizId={id} initial={quiz.data} />
}
