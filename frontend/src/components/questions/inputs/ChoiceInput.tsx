import { Check } from 'lucide-react'

import { quizTheme } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'
import type { Answer, Option } from '@/types/questions'

type ChoiceInputProps = {
  options: Option[]
  multiple: boolean
  value: Answer | undefined
  onChange: (value: Answer) => void
  theme: string
  disabled?: boolean
}

export function ChoiceInput({ options, multiple, value, onChange, theme, disabled }: ChoiceInputProps) {
  const selected = multiple ? (Array.isArray(value) ? (value as string[]) : []) : typeof value === 'string' ? [value] : []
  const colors = quizTheme(theme)

  const toggle = (id: string) => {
    if (!multiple) return onChange(id)
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <div className="space-y-2">
      {multiple && <p className="text-sm font-semibold text-muted-foreground">Izberi vse pravilne odgovore.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option, index) => {
          const isSelected = selected.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option.id)}
              aria-pressed={isSelected}
              className={cn(
                'flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition',
                'hover:border-foreground/20 disabled:cursor-default disabled:hover:border-border',
                isSelected ? cn('border-transparent shadow-md', colors.solid) : 'bg-card',
              )}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-sm font-black',
                  isSelected ? 'bg-white/25' : 'bg-muted text-muted-foreground',
                  multiple && 'rounded-lg',
                )}
              >
                {isSelected && multiple ? <Check className="size-4" /> : String.fromCharCode(65 + index)}
              </span>
              <span className="min-w-0 break-words">{option.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
