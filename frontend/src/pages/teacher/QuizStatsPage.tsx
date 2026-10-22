import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Clock, Download, Pencil, Target, Trophy, Users } from 'lucide-react'
import { toast } from 'sonner'

import { AccessCodeChip } from '@/components/quiz/AccessCodeChip'
import { QuizCover } from '@/components/quiz/QuizCover'
import { AttemptsByDayChart, DistributionChart, QuestionSuccessChart } from '@/components/stats/StatsCharts'
import { StatTile } from '@/components/stats/StatTile'
import { StudentTables } from '@/components/stats/StudentTables'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api, downloadFile, errorMessage } from '@/lib/api'
import { formatDuration, formatPercent, plural } from '@/lib/format'
import type { QuizStats } from '@/types/stats'

export function QuizStatsPage() {
  const { quizId } = useParams()
  const stats = useQuery({
    queryKey: ['teacher', 'stats', quizId],
    queryFn: () => api<QuizStats>(`/teacher/quizzes/${quizId}/stats`),
  })

  if (stats.isPending) return <Skeleton className="h-[30rem] rounded-3xl" />
  if (stats.isError) return <p className="py-16 text-center font-bold">{errorMessage(stats.error)}</p>

  const s = stats.data
  const { summary } = s

  return (
    <div className="space-y-6">
      <Link
        to="/ucitelj/kvizi"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Moji kvizi
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <QuizCover theme={s.theme} emoji={s.emoji} className="size-16 rounded-2xl text-3xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-muted-foreground">Statistika</p>
          <h1 className="truncate text-3xl font-black tracking-tight">{s.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {s.status === 'published' ? (
              <Badge className="bg-success text-white">Objavljen</Badge>
            ) : (
              <Badge variant="outline">Osnutek</Badge>
            )}
            {s.access_code && <AccessCodeChip code={s.access_code} />}
          </div>
        </div>
        <div className="flex gap-2">
          {summary.attempts > 0 && (
            <Button
              variant="outline"
              onClick={() =>
                downloadFile(`/teacher/quizzes/${s.quiz_id}/results.csv`, `rezultati-${s.quiz_id}.csv`).catch((error) =>
                  toast.error(errorMessage(error)),
                )
              }
            >
              <Download /> Izvozi CSV
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to={`/ucitelj/kvizi/${s.quiz_id}/uredi`}>
              <Pencil /> Uredi
            </Link>
          </Button>
        </div>
      </div>

      {summary.attempts === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed py-16 text-center">
          <p className="text-5xl">📊</p>
          <p className="text-lg font-bold">Kviz še nima oddanih poskusov</p>
          <p className="max-w-sm text-muted-foreground">
            Ko bodo učenci oddali prve poskuse, bodo tukaj rezultati, časi reševanja in uspešnost po nalogah.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Users}
              label="Učenci"
              value={String(summary.students)}
              hint={plural(summary.attempts, ['oddan poskus', 'oddana poskusa', 'oddani poskusi', 'oddanih poskusov'])}
            />
            <StatTile
              icon={Target}
              label="Povprečen rezultat"
              value={formatPercent(summary.average_percent)}
              hint={`najboljši ${formatPercent(summary.best_percent)}`}
            />
            <StatTile
              icon={Clock}
              label="Povprečen čas"
              value={formatDuration(summary.average_seconds)}
              hint={`najhitreje ${formatDuration(summary.fastest_seconds)}`}
            />
            <StatTile icon={Trophy} label="Vse pravilno" value={`${summary.perfect_count}×`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DistributionChart data={s.distribution} />
            <AttemptsByDayChart data={s.by_day} />
          </div>
          <QuestionSuccessChart data={s.questions} />
          <StudentTables stats={s} />
        </>
      )}
    </div>
  )
}
