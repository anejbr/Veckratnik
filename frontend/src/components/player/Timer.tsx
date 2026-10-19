import { Hourglass, Timer as TimerIcon } from 'lucide-react'

import { formatClock } from '@/lib/format'
import { cn } from '@/lib/utils'

type TimerProps = {
  elapsed: number
  limit: number | null
  visible: boolean
}

export function Timer({ elapsed, limit, visible }: TimerProps) {
  if (limit) {
    const remaining = Math.max(0, limit - elapsed)
    const urgent = remaining <= 30
    return (
      <span
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-lg font-black tabular-nums',
          urgent ? 'animate-pulse bg-destructive text-white' : 'bg-card shadow-sm',
        )}
        aria-label="Preostali čas"
      >
        <Hourglass className="size-4" /> {formatClock(remaining)}
      </span>
    )
  }
  if (!visible) return null
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 font-mono text-lg font-black tabular-nums shadow-sm" aria-label="Čas reševanja">
      <TimerIcon className="size-4" /> {formatClock(elapsed)}
    </span>
  )
}
