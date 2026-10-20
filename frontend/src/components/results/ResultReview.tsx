import { CircleCheck, CircleX, CircleMinus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { QuestionResult } from '@/types/attempt'

function points(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')
}

function StatusIcon({ result }: { result: QuestionResult }) {
  if (result.correct) return <CircleCheck className="size-6 shrink-0 text-success" />
  if (result.earned > 0) return <CircleMinus className="size-6 shrink-0 text-amber-500" />
  return <CircleX className="size-6 shrink-0 text-destructive" />
}

/** Pregled odgovorov po nalogah (za učenca in za učitelja). */
export function ResultReview({ results, showExpected }: { results: QuestionResult[]; showExpected: boolean }) {
  return (
    <ol className="space-y-3">
      {results.map((result, index) => (
        <li key={result.id} className="rounded-2xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <StatusIcon result={result} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold whitespace-pre-line">
                  <span className="text-muted-foreground">{index + 1}. </span>
                  {result.prompt || 'Naloga'}
                </p>
                <Badge variant={result.correct ? 'secondary' : 'outline'} className="shrink-0">
                  {points(result.earned)}/{points(result.max)}
                </Badge>
              </div>

              {result.items && result.items.length > 0 ? (
                <ul className="grid gap-1 text-sm sm:grid-cols-2">
                  {result.items.map((item, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 font-semibold tabular-nums',
                        item.correct ? 'bg-success/10' : 'bg-destructive/10',
                      )}
                    >
                      <span>{item.text}</span>
                      <span>
                        <span className={item.correct ? 'text-success' : 'text-destructive line-through'}>
                          {item.given || '–'}
                        </span>
                        {!item.correct && showExpected && item.expected && (
                          <span className="ml-2 text-success">{item.expected}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <dl className="grid gap-1 text-sm">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Tvoj odgovor:</dt>
                    <dd className={cn('font-semibold', result.correct ? 'text-success' : 'text-destructive')}>
                      {result.given || '–'}
                    </dd>
                  </div>
                  {!result.correct && showExpected && result.expected && (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-muted-foreground">Pravilno:</dt>
                      <dd className="font-semibold text-success">{result.expected}</dd>
                    </div>
                  )}
                </dl>
              )}

              {showExpected && result.explanation && (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm">💡 {result.explanation}</p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
