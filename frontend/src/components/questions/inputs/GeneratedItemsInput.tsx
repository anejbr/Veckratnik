import { useRef, type KeyboardEvent } from 'react'

import type { Answer, Item } from '@/types/questions'

type GeneratedItemsInputProps = {
  items: Item[]
  value: Answer | undefined
  onChange: (value: Answer) => void
  disabled?: boolean
}

/** Seznam generiranih računov (poštevanka, računi) z vpisom rezultata. */
export function GeneratedItemsInput({ items, value, onChange, disabled }: GeneratedItemsInputProps) {
  const answers = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, string>) : {}
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      inputs.current[index + 1]?.focus()
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <label key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 bg-card px-4 py-2">
          <span className="text-2xl font-black tabular-nums">{item.text} =</span>
          <input
            ref={(el) => {
              inputs.current[index] = el
            }}
            value={answers[item.id] ?? ''}
            onChange={(event) => onChange({ ...answers, [item.id]: event.target.value })}
            onKeyDown={(event) => onKeyDown(event, index)}
            disabled={disabled}
            inputMode="numeric"
            autoComplete="off"
            aria-label={item.text}
            className="h-12 w-24 rounded-xl border-2 bg-background text-center text-2xl font-bold tabular-nums outline-none focus:border-primary"
          />
        </label>
      ))}
    </div>
  )
}
