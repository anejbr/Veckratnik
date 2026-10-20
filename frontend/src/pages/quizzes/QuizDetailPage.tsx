import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, BookOpen, Clock, ListChecks, Lock, Pencil, Play, Repeat, Trophy, User } from 'lucide-react'
import { toast } from 'sonner'

import { AccessCodeDialog } from '@/components/quiz/AccessCodeDialog'
import { QuizCover } from '@/components/quiz/QuizCover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, api, errorMessage } from '@/lib/api'
import { formatDuration, formatPercent, plural, taskWord } from '@/lib/format'
import type { AttemptView } from '@/types/attempt'
import type { QuizPublicDetail } from '@/types/quiz'

export function QuizDetailPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [codeOpen, setCodeOpen] = useState(false)
  const quiz = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => api<QuizPublicDetail>(`/quizzes/${quizId}`),
  })

  const start = useMutation({
    mutationFn: (accessCode?: string) =>
      api<AttemptView>(`/quizzes/${quizId}/attempts`, { method: 'POST', body: { access_code: accessCode ?? null } }),
    onSuccess: (attempt) => {
      queryClient.setQueryData(['attempt', String(attempt.id)], attempt)
      navigate(`/kvizi/${attempt.quiz_id}/resevanje/${attempt.id}`)
    },
    onError: (error) => {
      if (!codeOpen) toast.error(errorMessage(error))
    },
  })

  if (quiz.isPending) return <Skeleton className="h-96 rounded-3xl" />
  if (quiz.isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold">{errorMessage(quiz.error)}</p>
        <Button asChild variant="link">
          <Link to="/kvizi">Nazaj na kvize</Link>
        </Button>
      </div>
    )
  }

  const q = quiz.data
  const facts = [
    { icon: ListChecks, text: taskWord(q.question_count) },
    q.time_limit_seconds ? { icon: Clock, text: `Časovna omejitev ${formatDuration(q.time_limit_seconds)}` } : null,
    q.max_attempts
      ? { icon: Repeat, text: `Največ ${plural(q.max_attempts, ['poskus', 'poskusa', 'poskusi', 'poskusov'])}` }
      : null,
    q.locked ? { icon: Lock, text: 'Zaklenjen s kodo' } : null,
    { icon: User, text: q.owner_name },
  ].filter((fact) => fact !== null)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/kvizi"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Vsi kvizi
      </Link>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <QuizCover theme={q.theme} emoji={q.emoji} locked={q.locked} className="h-44 text-7xl" />
        <div className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {q.grade && <Badge variant="secondary">{q.grade}. razred</Badge>}
              {q.status === 'draft' && <Badge variant="outline">Osnutek</Badge>}
              {q.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-semibold">
                  #{tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-black tracking-tight">{q.title}</h1>
            {q.description && <p className="text-lg whitespace-pre-line text-muted-foreground">{q.description}</p>}
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {facts.map((fact) => (
              <li key={fact.text} className="flex items-center gap-2 text-sm font-semibold">
                <fact.icon className="size-4 text-muted-foreground" /> {fact.text}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              className="h-12 w-full text-base sm:w-auto sm:px-8"
              disabled={start.isPending}
              onClick={() => (q.locked && !q.is_owner ? setCodeOpen(true) : start.mutate(undefined))}
            >
              <Play /> {q.my_attempts > 0 ? 'Reši znova' : 'Začni reševati'}
            </Button>
            {q.is_owner && (
              <Button asChild size="lg" variant="outline" className="h-12 w-full text-base sm:w-auto">
                <Link to={`/ucitelj/kvizi/${q.id}/uredi`}>
                  <Pencil /> Uredi kviz
                </Link>
              </Button>
            )}
          </div>

          {q.my_attempts > 0 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
              <span className="flex items-center gap-1.5">
                <Trophy className="size-4" /> Tvoj najboljši rezultat: {formatPercent(q.my_best_percent)}
              </span>
              <span>Najhitrejši čas: {formatDuration(q.my_best_seconds)}</span>
              <Link to="/moji-rezultati" className="underline-offset-2 hover:underline">
                {plural(q.my_attempts, ['poskus', 'poskusa', 'poskusi', 'poskusov'])}
              </Link>
            </div>
          )}

          {q.sources.length > 0 && (
            <details className="rounded-xl bg-muted/60 p-4 text-sm">
              <summary className="flex cursor-pointer items-center gap-2 font-semibold">
                <BookOpen className="size-4" /> Viri za naloge
              </summary>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                {q.sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      <AccessCodeDialog
        open={codeOpen}
        onOpenChange={(open) => {
          setCodeOpen(open)
          start.reset()
        }}
        onSubmit={(code) => start.mutate(code)}
        pending={start.isPending}
        error={start.error instanceof ApiError ? start.error.message : null}
      />
    </div>
  )
}
