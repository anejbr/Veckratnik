import { ListEditor } from '@/components/builder/editors/ListEditor'
import type { EditorProps } from '@/components/builder/editors/types'
import { Segmented } from '@/components/form/Segmented'
import { Label } from '@/components/ui/label'

const DIRECTIONS = ['od najmanjšega do največjega', 'od največjega do najmanjšega']

export function OrderingEditor({ question, onChange }: EditorProps<'ordering'>) {
  return (
    <div className="space-y-3">
      <div className="grid gap-1.5">
        <Label className="font-semibold">Smer</Label>
        <Segmented
          value={question.direction_label}
          onChange={(direction_label) => onChange({ ...question, direction_label })}
          options={DIRECTIONS.map((d) => ({ value: d, label: d.replace('od ', '').replace(' do ', ' → ') }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-semibold">Elementi v pravilnem vrstnem redu</Label>
        <p className="text-xs text-muted-foreground">Učenec jih dobi premešane.</p>
        <ListEditor
          values={question.items}
          onChange={(items) => onChange({ ...question, items })}
          placeholder={(i) => `${i + 1}. element`}
          addLabel="Dodaj element"
          min={2}
          sortable
        />
      </div>
    </div>
  )
}
