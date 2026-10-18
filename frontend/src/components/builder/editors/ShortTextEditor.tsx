import { ListEditor } from '@/components/builder/editors/ListEditor'
import type { EditorProps } from '@/components/builder/editors/types'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function ShortTextEditor({ question, onChange }: EditorProps<'short_text'>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="font-semibold">Sprejeti odgovori</Label>
        <p className="text-xs text-muted-foreground">Odgovor je pravilen, če se ujema s katerimkoli od teh.</p>
        <ListEditor
          values={question.accepted}
          onChange={(accepted) => onChange({ ...question, accepted })}
          placeholder={(i) => (i === 0 ? 'npr. zmnožek' : 'drug zapis')}
          addLabel="Dodaj odgovor"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="case_sensitive"
          checked={question.case_sensitive}
          onCheckedChange={(case_sensitive) => onChange({ ...question, case_sensitive })}
        />
        <Label htmlFor="case_sensitive">Razlikuj velike in male črke</Label>
      </div>
    </div>
  )
}
