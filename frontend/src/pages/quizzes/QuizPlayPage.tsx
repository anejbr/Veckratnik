import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router'

import { QuizPlayer } from '@/components/player/QuizPlayer'
import { Button } from '@/components/ui/button'
import { api, errorMessage } from '@/lib/api'
import { isResult, type AttemptResult, type AttemptView } from '@/types/attempt'

export function QuizPlayPage() {
  const { attemptId } = useParams()
  const attempt = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => api<AttemptView | AttemptResult>(`/attempts/${attemptId}`),
    staleTime: Infinity,
  })

  if (attempt.isPending) {
    return <div className="grid min-h-svh place-items-center text-muted-foreground">Pripravljam naloge …</div>
  }
  if (attempt.isError) {
    return (
      <div className="grid min-h-svh place-items-center text-center">
        <div>
          <p className="text-lg font-bold">{errorMessage(attempt.error)}</p>
          <Button asChild variant="link">
            <Link to="/kvizi">Nazaj na kvize</Link>
          </Button>
        </div>
      </div>
    )
  }
  if (isResult(attempt.data)) return <Navigate to={`/rezultati/${attempt.data.id}`} replace />
  return <QuizPlayer attempt={attempt.data} />
}
