import { quizTheme } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'
import type { Answer, CompareSign } from '@/types/questions'

type CompareInputProps = {
  left: string
  right: string
  value: Answer | undefined
  onChange: (value: Answer) => void
  theme: string
  disabled?: boolean
}

const SIGNS: CompareSign[] = ['<', '=', '>']

export function CompareInput({ left, right, value, onChange, theme, disabled }: CompareInputProps) {
  const colors = quizTheme(theme)
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-muted/50 p-5 sm:justify-start">
      <span className="text-3xl font-black">{left}</span>
      <div className="flex gap-2">
        {SIGNS.map((sign) => (
          <button
            key={sign}
            type="button"
            disabled={disabled}
            aria-pressed={value === sign}
            onClick={() => onChange(sign)}
            className={cn(
              'grid size-14 place-items-center rounded-2xl border-2 bg-card text-3xl font-black transition hover:border-foreground/20',
              value === sign && cn('border-transparent shadow-md', colors.solid),
            )}
          >
            {sign}
          </button>
        ))}
      </div>
      <span className="text-3xl font-black">{right}</span>
    </div>
  )
}
