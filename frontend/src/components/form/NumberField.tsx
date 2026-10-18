import { useState, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'

type NumberFieldProps = Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
  value: number | null
  onValueChange: (value: number | null) => void
  integer?: boolean
}

const format = (value: number | null) => (value == null ? '' : String(value).replace('.', ','))
const parse = (text: string) => Number(text.replace(',', '.'))

/** Vnos števila, ki dovoli tudi decimalno vejico in začasno prazno polje. */
export function NumberField({ value, onValueChange, integer, ...props }: NumberFieldProps) {
  const [text, setText] = useState(() => format(value))
  const [prevValue, setPrevValue] = useState(value)

  // vrednost se je spremenila od zunaj (npr. druga naloga) – posodobi besedilo
  if (!Object.is(value, prevValue)) {
    setPrevValue(value)
    if (!(text.trim() !== '' && Object.is(parse(text), value))) setText(format(value))
  }

  return (
    <Input
      inputMode={integer ? 'numeric' : 'decimal'}
      value={text}
      onChange={(event) => {
        const next = event.target.value
        setText(next)
        if (next.trim() === '') return onValueChange(null)
        const parsed = parse(next)
        if (Number.isFinite(parsed)) onValueChange(integer ? Math.trunc(parsed) : parsed)
      }}
      {...props}
    />
  )
}
