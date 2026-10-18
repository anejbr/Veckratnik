import { ArrowRight, Plus, Trash } from 'lucide-react'

import type { EditorProps } from '@/components/builder/editors/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MatchingEditor({ question, onChange }: EditorProps<'matching'>) {
  const setPair = (index: number, side: 'left' | 'right', value: string) =>
    onChange({ ...question, pairs: question.pairs.map((p, i) => (i === index ? { ...p, [side]: value } : p)) })

  return (
    <div className="space-y-2">
      <Label className="font-semibold">Pari</Label>
      <p className="text-xs text-muted-foreground">Desna stran se učencu premeša.</p>
      <ul className="space-y-2">
        {question.pairs.map((pair, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <Input value={pair.left} onChange={(event) => setPair(index, 'left', event.target.value)} placeholder="npr. 4 · 5" />
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            <Input value={pair.right} onChange={(event) => setPair(index, 'right', event.target.value)} placeholder="20" />
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={question.pairs.length <= 2}
              onClick={() => onChange({ ...question, pairs: question.pairs.filter((_, i) => i !== index) })}
              aria-label="Odstrani par"
            >
              <Trash />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        disabled={question.pairs.length >= 8}
        onClick={() => onChange({ ...question, pairs: [...question.pairs, { left: '', right: '' }] })}
      >
        <Plus /> Dodaj par
      </Button>
    </div>
  )
}
