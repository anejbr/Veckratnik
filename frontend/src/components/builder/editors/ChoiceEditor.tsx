import { Check, Plus, Trash } from 'lucide-react'

import type { EditorProps } from '@/components/builder/editors/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Option } from '@/types/questions'

function nextId(options: Option[]): string {
  const used = new Set(options.map((o) => o.id))
  for (let i = 0; i < 26; i++) {
    const id = String.fromCharCode(97 + i)
    if (!used.has(id)) return id
  }
  return crypto.randomUUID().slice(0, 8)
}

export function ChoiceEditor({ question, onChange }: EditorProps<'single_choice' | 'multiple_choice'>) {
  const multiple = question.type === 'multiple_choice'
  const max = multiple ? 10 : 8
  const correct = multiple ? question.correct : [question.correct]

  const setOptions = (options: Option[], nextCorrect = correct) => {
    const valid = nextCorrect.filter((id) => options.some((o) => o.id === id))
    if (question.type === 'multiple_choice') onChange({ ...question, options, correct: valid })
    else onChange({ ...question, options, correct: valid[0] ?? '' })
  }

  const toggleCorrect = (id: string) => {
    if (question.type === 'multiple_choice') {
      const next = correct.includes(id) ? correct.filter((c) => c !== id) : [...correct, id]
      onChange({ ...question, correct: next })
    } else {
      onChange({ ...question, correct: id })
    }
  }

  return (
    <div className="space-y-2">
      <Label className="font-semibold">Možnosti</Label>
      <p className="text-xs text-muted-foreground">
        {multiple ? 'Označi vse pravilne možnosti.' : 'Označi pravilno možnost.'} Učenci jih dobijo premešane (če je
        vklopljeno v nastavitvah).
      </p>
      <ul className="space-y-2">
        {question.options.map((option, index) => {
          const isCorrect = correct.includes(option.id)
          return (
            <li key={option.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleCorrect(option.id)}
                aria-label={isCorrect ? 'Pravilen odgovor' : 'Označi kot pravilno'}
                aria-pressed={isCorrect}
                className={cn(
                  'grid size-8 shrink-0 place-items-center border-2 text-xs font-black transition',
                  multiple ? 'rounded-lg' : 'rounded-full',
                  isCorrect ? 'border-success bg-success text-white' : 'border-border text-muted-foreground hover:border-success',
                )}
              >
                {isCorrect ? <Check className="size-4" /> : String.fromCharCode(65 + index)}
              </button>
              <Input
                value={option.text}
                onChange={(event) =>
                  setOptions(question.options.map((o) => (o.id === option.id ? { ...o, text: event.target.value } : o)))
                }
                placeholder={`Možnost ${String.fromCharCode(65 + index)}`}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={question.options.length <= 2}
                onClick={() => setOptions(question.options.filter((o) => o.id !== option.id))}
                aria-label="Odstrani možnost"
              >
                <Trash />
              </Button>
            </li>
          )
        })}
      </ul>
      <Button
        variant="outline"
        size="sm"
        disabled={question.options.length >= max}
        onClick={() => setOptions([...question.options, { id: nextId(question.options), text: '' }])}
      >
        <Plus /> Dodaj možnost
      </Button>
    </div>
  )
}
