import type { EditorProps } from '@/components/builder/editors/types'
import { FormField } from '@/components/form/FormField'
import { Input } from '@/components/ui/input'
import { compareSign } from '@/lib/expr'

export function CompareEditor({ question, onChange }: EditorProps<'compare'>) {
  const sign = compareSign(question.left, question.right)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <FormField id="left" label="Levi izraz">
          <Input id="left" value={question.left} onChange={(event) => onChange({ ...question, left: event.target.value })} />
        </FormField>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-lg font-black">{sign ?? '?'}</span>
        <FormField id="right" label="Desni izraz">
          <Input id="right" value={question.right} onChange={(event) => onChange({ ...question, right: event.target.value })} />
        </FormField>
      </div>
      <p className="text-xs text-muted-foreground">
        {sign
          ? `Pravilen znak (${sign}) se izračuna samodejno.`
          : 'Uporabi števila in znake + − · : ter oklepaje, npr. 3 · (4 + 2).'}
      </p>
    </div>
  )
}
