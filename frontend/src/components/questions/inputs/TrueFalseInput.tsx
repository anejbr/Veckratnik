import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Answer } from '@/types/questions'

type TrueFalseInputProps = {
  value: Answer | undefined
  onChange: (value: Answer) => void
  disabled?: boolean
}

export function TrueFalseInput({ value, onChange, disabled }: TrueFalseInputProps) {
  const choices = [
    { value: true, label: 'Drži', icon: Check, active: 'bg-emerald-500 text-white border-transparent' },
    { value: false, label: 'Ne drži', icon: X, active: 'bg-rose-500 text-white border-transparent' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:max-w-md">
      {choices.map((choice) => (
        <button
          key={choice.label}
          type="button"
          disabled={disabled}
          aria-pressed={value === choice.value}
          onClick={() => onChange(choice.value)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-2xl border-2 bg-card p-5 text-lg font-extrabold transition hover:border-foreground/20',
            value === choice.value && cn('shadow-md', choice.active),
          )}
        >
          <choice.icon className="size-7" />
          {choice.label}
        </button>
      ))}
    </div>
  )
}
