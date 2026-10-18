import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { ArrowLeft, BookOpen, Clock, ListChecks, Lock, Pencil, Repeat, User } from 'lucide-react'

import { QuizCover } from '@/components/quiz/QuizCover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { formatDuration, plural, taskWord } from '@/lib/format'
import type { QuizPublicDetail } from '@/types/quiz'

export function QuizDetailPage() {
  const { quizId } = useParams()
  const quiz = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => api<QuizPublicDetail>(`/quizzes/${quizId}`),
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
            <Button size="lg" className="h-12 w-full text-base sm:w-auto sm:px-8" disabled>
              Reševanje kmalu
            </Button>
            {q.is_owner && (
              <Button asChild size="lg" variant="outline" className="h-12 w-full text-base sm:w-auto">
                <Link to={`/ucitelj/kvizi/${q.id}/uredi`}>
                  <Pencil /> Uredi kviz
                </Link>
              </Button>
            )}
          </div>

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
    </div>
  )
}
