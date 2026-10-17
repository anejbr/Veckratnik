import { Lock } from 'lucide-react'

import { quizTheme } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'

type QuizCoverProps = {
  theme: string
  emoji: string
  locked?: boolean
  className?: string
}

export function QuizCover({ theme, emoji, locked, className }: QuizCoverProps) {
  return (
    <div
      className={cn(
        'relative grid place-items-center overflow-hidden bg-gradient-to-br text-5xl',
        quizTheme(theme).cover,
        className,
      )}
    >
      <span aria-hidden className="absolute -top-3 -left-2 text-6xl font-black text-white/15 select-none">
        ×
      </span>
      <span aria-hidden className="absolute -right-1 -bottom-5 text-7xl font-black text-white/15 select-none">
        ÷
      </span>
      <span className="drop-shadow-sm">{emoji}</span>
      {locked && (
        <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/25 text-white">
          <Lock className="size-3.5" />
        </span>
      )}
    </div>
  )
}
