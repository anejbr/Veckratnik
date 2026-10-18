import { GeneratorPreview } from '@/components/builder/editors/GeneratorPreview'
import type { EditorProps } from '@/components/builder/editors/types'
import { FormField } from '@/components/form/FormField'
import { NumberField } from '@/components/form/NumberField'
import { Segmented } from '@/components/form/Segmented'
import { Label } from '@/components/ui/label'
import { sampleTimesTable } from '@/lib/generators'
import { cn } from '@/lib/utils'

const FACTORS = Array.from({ length: 12 }, (_, i) => i + 1)

export function TimesTableEditor({ question, onChange }: EditorProps<'times_table'>) {
  const toggleFactor = (factor: number) => {
    const factors = question.factors.includes(factor)
      ? question.factors.filter((f) => f !== factor)
      : [...question.factors, factor].sort((a, b) => a - b)
    onChange({ ...question, factors })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="font-semibold">Poštevanka števil</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {FACTORS.map((factor) => (
            <button
              key={factor}
              type="button"
              aria-pressed={question.factors.includes(factor)}
              onClick={() => toggleFactor(factor)}
              className={cn(
                'h-9 rounded-lg border text-sm font-bold transition',
                question.factors.includes(factor)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card hover:border-primary/40',
              )}
            >
              {factor}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label className="font-semibold">Računi</Label>
        <Segmented
          value={question.operation}
          onChange={(operation) => onChange({ ...question, operation })}
          options={[
            { value: 'multiply', label: 'Množenje' },
            { value: 'divide', label: 'Deljenje' },
            { value: 'mixed', label: 'Mešano' },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FormField id="tt-max" label="Največji faktor" hint="npr. 10 → do 10 · n">
          <NumberField
            id="tt-max"
            integer
            value={question.max_multiplier}
            onValueChange={(value) => onChange({ ...question, max_multiplier: Math.min(12, Math.max(1, value ?? 10)) })}
          />
        </FormField>
        <FormField id="tt-count" label="Število računov">
          <NumberField
            id="tt-count"
            integer
            value={question.count}
            onValueChange={(value) => onChange({ ...question, count: Math.min(50, Math.max(1, value ?? 1)) })}
          />
        </FormField>
      </div>
      <GeneratorPreview generate={() => sampleTimesTable(question)} />
    </div>
  )
}
