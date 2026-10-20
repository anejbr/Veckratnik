import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ChevronRight, Clock, Target, Trophy } from 'lucide-react'

import { QuizCover } from '@/components/quiz/QuizCover'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { formatDateTime, formatDuration, formatPercent } from '@/lib/format'
import type { MyAttempt } from '@/types/attempt'

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </div>
  )
}

export function MyResultsPage() {
  const attempts = useQuery({ queryKey: ['my-attempts'], queryFn: () => api<MyAttempt[]>('/attempts/me') })

  if (attempts.isPending) return <Skeleton className="h-96 rounded-3xl" />
  if (attempts.isError) return <p className="text-destructive">{errorMessage(attempts.error)}</p>

  const list = attempts.data
  const average = list.length ? list.reduce((sum, a) => sum + a.percent, 0) / list.length : null
  const totalTime = list.reduce((sum, a) => sum + a.duration_seconds, 0)
  const perfect = list.filter((a) => a.percent === 100).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Moji rezultati</h1>
        <p className="mt-1 text-muted-foreground">Primerjaj se sam s sabo – vsak poskus je korak naprej.</p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
          <p className="text-5xl">📝</p>
          <p className="text-lg font-bold">Še nobenega rešenega kviza</p>
          <Button asChild>
            <Link to="/kvizi">Izberi kviz</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={Target} label="Povprečen rezultat" value={formatPercent(average)} />
            <Stat icon={Clock} label="Skupni čas reševanja" value={formatDuration(totalTime)} />
            <Stat icon={Trophy} label="Vse pravilno" value={`${perfect}×`} />
          </div>

          <ul className="space-y-2">
            {list.map((attempt) => (
              <li key={attempt.id}>
                <Link
                  to={`/rezultati/${attempt.id}`}
                  className="flex items-center gap-4 rounded-2xl border bg-card p-3 pr-4 shadow-sm transition hover:shadow-md"
                >
                  <QuizCover theme={attempt.theme} emoji={attempt.emoji} className="size-14 shrink-0 rounded-xl text-2xl" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-extrabold">{attempt.quiz_title}</p>
                      <p className="shrink-0 text-lg font-black tabular-nums">{formatPercent(attempt.percent)}</p>
                    </div>
                    <Progress value={attempt.percent} className="h-2" />
                    <p className="flex flex-wrap gap-x-3 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {formatDuration(attempt.duration_seconds)}
                      </span>
                      <span>{formatDateTime(attempt.finished_at)}</span>
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
