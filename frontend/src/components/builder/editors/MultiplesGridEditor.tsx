import type { EditorProps } from '@/components/builder/editors/types'
import { FormField } from '@/components/form/FormField'
import { NumberField } from '@/components/form/NumberField'
import { Segmented } from '@/components/form/Segmented'
import { cn } from '@/lib/utils'

export function MultiplesGridEditor({ question, onChange }: EditorProps<'multiples_grid'>) {
  const isMultiples = question.mode === 'multiples'
  const from = isMultiples ? question.range_from : 1
  const to = isMultiples ? question.range_to : question.number
  const numbers = to > from && to - from <= 99 ? Array.from({ length: to - from + 1 }, (_, i) => from + i) : []
  const isCorrect = (n: number) => (isMultiples ? n % question.number === 0 : question.number % n === 0)

  return (
    <div className="space-y-3">
      <Segmented
        value={question.mode}
        onChange={(mode) => onChange({ ...question, mode })}
        options={[
          { value: 'multiples', label: 'Večkratniki' },
          { value: 'divisors', label: 'Delitelji' },
        ]}
      />
      <div className="grid grid-cols-3 gap-2">
        <FormField id="grid-number" label="Število">
          <NumberField
            id="grid-number"
            integer
            value={question.number}
            onValueChange={(value) => onChange({ ...question, number: Math.min(200, Math.max(1, value ?? 1)) })}
          />
        </FormField>
        {isMultiples && (
          <>
            <FormField id="grid-from" label="Od">
              <NumberField
                id="grid-from"
                integer
                value={question.range_from}
                onValueChange={(value) => onChange({ ...question, range_from: Math.max(1, value ?? 1) })}
              />
            </FormField>
            <FormField id="grid-to" label="Do">
              <NumberField
                id="grid-to"
                integer
                value={question.range_to}
                onValueChange={(value) => onChange({ ...question, range_to: Math.min(500, Math.max(1, value ?? 1)) })}
              />
            </FormField>
          </>
        )}
      </div>
      {numbers.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Pravilna števila so obarvana:</p>
          <div className="grid grid-cols-10 gap-1">
            {numbers.map((n) => (
              <span
                key={n}
                className={cn(
                  'grid aspect-square place-items-center rounded text-[10px] font-bold',
                  isCorrect(n) ? 'bg-success text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
