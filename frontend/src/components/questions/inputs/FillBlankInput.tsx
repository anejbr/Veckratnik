import { Fragment } from 'react'

import type { Answer } from '@/types/questions'

type FillBlankInputProps = {
  template: string
  value: Answer | undefined
  onChange: (value: Answer) => void
  disabled?: boolean
}

export function FillBlankInput({ template, value, onChange, disabled }: FillBlankInputProps) {
  const segments = template.split('{}')
  const answers = Array.isArray(value) ? (value as string[]) : []

  const update = (index: number, text: string) => {
    const next = Array.from({ length: segments.length - 1 }, (_, i) => answers[i] ?? '')
    next[index] = text
    onChange(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-2xl font-bold">
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {segment && <span className="whitespace-pre-wrap">{segment}</span>}
          {index < segments.length - 1 && (
            <input
              value={answers[index] ?? ''}
              onChange={(event) => update(index, event.target.value)}
              disabled={disabled}
              autoComplete="off"
              aria-label={`Prazno mesto ${index + 1}`}
              className="h-12 w-24 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 text-center text-2xl font-bold outline-none focus:border-solid focus:border-primary"
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}
