import type { EditorProps } from '@/components/builder/editors/types'
import { Segmented } from '@/components/form/Segmented'
import { Label } from '@/components/ui/label'

export function TrueFalseEditor({ question, onChange }: EditorProps<'true_false'>) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-semibold">Trditev …</Label>
      <Segmented
        value={question.correct ? 'true' : 'false'}
        onChange={(value) => onChange({ ...question, correct: value === 'true' })}
        options={[
          { value: 'true', label: '✓ drži' },
          { value: 'false', label: '✗ ne drži' },
        ]}
      />
    </div>
  )
}
