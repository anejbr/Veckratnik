import type { EditorProps } from '@/components/builder/editors/types'
import { FormField } from '@/components/form/FormField'
import { NumberField } from '@/components/form/NumberField'
import { Input } from '@/components/ui/input'

export function NumericEditor({ question, onChange }: EditorProps<'numeric'>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField id="numeric-answer" label="Pravilen rezultat">
        <NumberField
          id="numeric-answer"
          value={Number.isFinite(question.answer) ? question.answer : null}
          onValueChange={(value) => onChange({ ...question, answer: value ?? Number.NaN })}
        />
      </FormField>
      <FormField id="numeric-tolerance" label="Odstopanje" hint="0 = točen rezultat">
        <NumberField
          id="numeric-tolerance"
          value={question.tolerance}
          onValueChange={(value) => onChange({ ...question, tolerance: Math.max(0, value ?? 0) })}
        />
      </FormField>
      <div className="col-span-2">
        <FormField id="numeric-unit" label="Enota (neobvezno)">
          <Input
            id="numeric-unit"
            value={question.unit ?? ''}
            maxLength={20}
            placeholder="npr. cm, €, jabolk"
            onChange={(event) => onChange({ ...question, unit: event.target.value || null })}
          />
        </FormField>
      </div>
    </div>
  )
}
