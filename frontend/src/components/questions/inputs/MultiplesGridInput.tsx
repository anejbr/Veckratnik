import { quizTheme } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'
import type { Answer } from '@/types/questions'

type MultiplesGridInputProps = {
  numbers: number[]
  value: Answer | undefined
  onChange: (value: Answer) => void
  theme: string
  disabled?: boolean
}

export function MultiplesGridInput({ numbers, value, onChange, theme, disabled }: MultiplesGridInputProps) {
  const selected = Array.isArray(value) ? (value as number[]) : []
  const colors = quizTheme(theme)

  const toggle = (n: number) =>
    onChange(selected.includes(n) ? selected.filter((s) => s !== n) : [...selected, n].sort((a, b) => a - b))

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {numbers.map((n) => {
        const isSelected = selected.includes(n)
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => toggle(n)}
            className={cn(
              'aspect-square rounded-xl border-2 bg-card text-lg font-bold transition hover:border-foreground/20',
              isSelected && cn('scale-105 border-transparent shadow', colors.solid),
            )}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
