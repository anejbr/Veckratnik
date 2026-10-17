import { Link } from 'react-router'
import { Clock, ListChecks } from 'lucide-react'

import { QuizCover } from '@/components/quiz/QuizCover'
import { Badge } from '@/components/ui/badge'
import { formatDuration, taskWord } from '@/lib/format'
import type { QuizSummary } from '@/types/quiz'

export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  return (
    <Link
      to={`/kvizi/${quiz.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <QuizCover theme={quiz.theme} emoji={quiz.emoji} locked={quiz.locked} className="h-28" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight font-extrabold group-hover:text-primary">{quiz.title}</h3>
          {quiz.grade && (
            <Badge variant="secondary" className="shrink-0">
              {quiz.grade}. r.
            </Badge>
          )}
        </div>
        {quiz.description && <p className="line-clamp-2 text-sm text-muted-foreground">{quiz.description}</p>}
        {quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {quiz.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-semibold">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <ListChecks className="size-3.5" /> {taskWord(quiz.question_count)}
          </span>
          {quiz.time_limit_seconds && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {formatDuration(quiz.time_limit_seconds)}
            </span>
          )}
          <span className="ml-auto truncate">{quiz.owner_name}</span>
        </div>
      </div>
    </Link>
  )
}
