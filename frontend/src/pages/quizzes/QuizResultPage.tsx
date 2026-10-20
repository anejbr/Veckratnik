import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router'
import { Clock, RotateCcw, Target, TrendingUp } from 'lucide-react'

import { QuizCover } from '@/components/quiz/QuizCover'
import { ResultReview } from '@/components/results/ResultReview'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { formatDuration, formatPercent } from '@/lib/format'
import { isResult, type AttemptResult, type AttemptView } from '@/types/attempt'

function cheer(percent: number): { emoji: string; text: string } {
  if (percent === 100) return { emoji: '🏆', text: 'Vse pravilno – odlično!' }
  if (percent >= 80) return { emoji: '🎉', text: 'Zelo dobro!' }
  if (percent >= 50) return { emoji: '👍', text: 'Dobro, še malo vaje.' }
  return { emoji: '💪', text: 'Ne obupaj – vaja dela mojstra!' }
}

function comparison(result: AttemptResult): string | null {
  const best = result.previous_best
  if (!best) return null
  if (result.percent > best.percent) return `Boljše kot doslej (prej ${formatPercent(best.percent)})!`
  if (result.percent === best.percent && best.duration_seconds != null) {
    const diff = best.duration_seconds - result.duration_seconds
    if (diff > 0) return `Enak rezultat, a ${formatDuration(diff)} hitreje kot prej!`
    if (diff < 0) return `Enak rezultat kot najboljši, ${formatDuration(-diff)} počasneje.`
    return 'Izenačen najboljši rezultat.'
  }
  return `Tvoj najboljši rezultat ostaja ${formatPercent(best.percent)}.`
}

export function QuizResultPage() {
  const { attemptId } = useParams()
  const attempt = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => api<AttemptView | AttemptResult>(`/attempts/${attemptId}`),
  })

  if (attempt.isPending) return <Skeleton className="mx-auto h-96 max-w-3xl rounded-3xl" />
  if (attempt.isError) return <p className="py-16 text-center font-bold">{errorMessage(attempt.error)}</p>
  if (!isResult(attempt.data)) {
    return <Navigate to={`/kvizi/${attempt.data.quiz_id}/resevanje/${attempt.data.id}`} replace />
  }

  const result = attempt.data
  const { emoji, text } = cheer(result.percent)
  const better = comparison(result)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <QuizCover theme={result.theme} emoji={result.emoji} className="h-24 text-5xl" />
        <div className="space-y-6 p-6 text-center sm:p-8">
          <div>
            <p className="text-6xl">{emoji}</p>
            <h1 className="mt-2 text-3xl font-black">{text}</h1>
            <p className="mt-1 text-muted-foreground">{result.quiz_title}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary p-5">
              <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-secondary-foreground">
                <Clock className="size-4" /> Čas reševanja
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums">{formatDuration(result.duration_seconds)}</p>
            </div>
            <div className="rounded-2xl bg-secondary p-5">
              <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-secondary-foreground">
                <Target className="size-4" /> Rezultat
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums">{formatPercent(result.percent)}</p>
              <p className="text-sm font-semibold text-muted-foreground">
                {result.score.toString().replace('.', ',')} / {result.max_score} točk
              </p>
            </div>
          </div>
          <Progress value={result.percent} className="h-3" />

          {result.timed_out && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Čas je potekel, zato je bil kviz oddan samodejno.
            </p>
          )}
          {better && (
            <p className="flex items-center justify-center gap-2 font-semibold text-primary">
              <TrendingUp className="size-4" /> {better}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild size="lg">
              <Link to={`/kvizi/${result.quiz_id}`}>
                <RotateCcw /> Poskusi znova
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/kvizi">Vsi kvizi</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Pregled nalog</h2>
        {!result.show_correct_answers && (
          <p className="text-sm text-muted-foreground">Učitelj je izbral, da se pravilni odgovori ne prikažejo.</p>
        )}
        <ResultReview results={result.results} showExpected={result.show_correct_answers} />
      </section>
    </div>
  )
}
