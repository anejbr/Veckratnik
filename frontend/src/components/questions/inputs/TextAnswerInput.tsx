import { Input } from '@/components/ui/input'
import type { Answer } from '@/types/questions'

type TextAnswerInputProps = {
  numeric: boolean
  unit?: string | null
  value: Answer | undefined
  onChange: (value: Answer) => void
  disabled?: boolean
}

export function TextAnswerInput({ numeric, unit, value, onChange, disabled }: TextAnswerInputProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        inputMode={numeric ? 'decimal' : 'text'}
        autoComplete="off"
        disabled={disabled}
        placeholder={numeric ? 'Rezultat' : 'Tvoj odgovor'}
        aria-label="Odgovor"
        className="h-14 max-w-xs rounded-xl text-2xl! font-bold"
      />
      {unit && <span className="text-lg font-semibold text-muted-foreground">{unit}</span>}
    </div>
  )
}
