import { GeneratorPreview } from '@/components/builder/editors/GeneratorPreview'
import type { EditorProps } from '@/components/builder/editors/types'
import { FormField } from '@/components/form/FormField'
import { NumberField } from '@/components/form/NumberField'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { sampleArithmetic } from '@/lib/generators'
import { OPERATION_SYMBOLS } from '@/lib/question-catalog'
import { cn } from '@/lib/utils'
import type { ArithmeticOperation } from '@/types/questions'

const OPERATIONS: { value: ArithmeticOperation; label: string }[] = [
  { value: '+', label: 'seštevanje' },
  { value: '-', label: 'odštevanje' },
  { value: '*', label: 'množenje' },
  { value: ':', label: 'deljenje' },
]

export function ArithmeticEditor({ question, onChange }: EditorProps<'arithmetic'>) {
  const toggle = (op: ArithmeticOperation) => {
    const operations = question.operations.includes(op)
      ? question.operations.filter((o) => o !== op)
      : OPERATIONS.map((o) => o.value).filter((o) => o === op || question.operations.includes(o))
    onChange({ ...question, operations })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="font-semibold">Računske operacije</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {OPERATIONS.map((op) => (
            <button
              key={op.value}
              type="button"
              title={op.label}
              aria-pressed={question.operations.includes(op.value)}
              onClick={() => toggle(op.value)}
              className={cn(
                'h-10 rounded-lg border text-xl font-black transition',
                question.operations.includes(op.value)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card hover:border-primary/40',
              )}
            >
              {OPERATION_SYMBOLS[op.value]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <FormField id="ar-min" label="Od">
          <NumberField
            id="ar-min"
            integer
            value={question.min_value}
            onValueChange={(value) => onChange({ ...question, min_value: Math.max(0, value ?? 0) })}
          />
        </FormField>
        <FormField id="ar-max" label="Do">
          <NumberField
            id="ar-max"
            integer
            value={question.max_value}
            onValueChange={(value) => onChange({ ...question, max_value: Math.min(10000, Math.max(1, value ?? 1)) })}
          />
        </FormField>
        <FormField id="ar-count" label="Računov">
          <NumberField
            id="ar-count"
            integer
            value={question.count}
            onValueChange={(value) => onChange({ ...question, count: Math.min(50, Math.max(1, value ?? 1)) })}
          />
        </FormField>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="allow_negative"
          checked={question.allow_negative}
          onCheckedChange={(allow_negative) => onChange({ ...question, allow_negative })}
        />
        <Label htmlFor="allow_negative">Dovoli negativne rezultate</Label>
      </div>
      <GeneratorPreview generate={() => sampleArithmetic(question)} />
    </div>
  )
}
