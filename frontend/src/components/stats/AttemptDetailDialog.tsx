import { useQuery } from '@tanstack/react-query'

import { ResultReview } from '@/components/results/ResultReview'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { formatDateTime, formatDuration, formatPercent } from '@/lib/format'
import { isResult, type AttemptResult, type AttemptView } from '@/types/attempt'

export function AttemptDetailDialog({ attemptId, onClose }: { attemptId: number | null; onClose: () => void }) {
  const attempt = useQuery({
    queryKey: ['attempt', String(attemptId)],
    queryFn: () => api<AttemptResult | AttemptView>(`/attempts/${attemptId}`),
    enabled: attemptId !== null,
  })
  const result = attempt.data && isResult(attempt.data) ? attempt.data : null

  return (
    <Dialog open={attemptId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{result ? result.student_name : 'Poskus'}</DialogTitle>
          {result && (
            <DialogDescription>
              {result.attempt_number}. poskus · {formatPercent(result.percent)} · čas {formatDuration(result.duration_seconds)} ·
              oddano {formatDateTime(result.finished_at)}
              {result.timed_out && ' · čas je potekel'}
            </DialogDescription>
          )}
        </DialogHeader>
        {attempt.isPending ? (
          <Skeleton className="h-64" />
        ) : attempt.isError ? (
          <p className="text-destructive">{errorMessage(attempt.error)}</p>
        ) : result ? (
          <ResultReview results={result.results} showExpected givenLabel="Odgovor" />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
