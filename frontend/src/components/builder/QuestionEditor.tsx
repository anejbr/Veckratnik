import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { PaletteIcon } from '@/components/builder/ElementPalette'
import { ChoiceEditor } from '@/components/builder/editors/ChoiceEditor'
import { NumericEditor } from '@/components/builder/editors/NumericEditor'
import { TrueFalseEditor } from '@/components/builder/editors/TrueFalseEditor'
import type { BuilderQuestion } from '@/components/builder/useQuizDraft'
import { FormField } from '@/components/form/FormField'
import { NumberField } from '@/components/form/NumberField'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { catalogEntry, isGenerator } from '@/lib/question-catalog'
import { questionIssues } from '@/lib/question-validation'
import { cn } from '@/lib/utils'
import type { QuestionDraft } from '@/types/questions'

type QuestionEditorProps = {
  question: BuilderQuestion
  onChange: (question: QuestionDraft) => void
}

export function QuestionEditor({ question, onChange }: QuestionEditorProps) {
  const [moreOpen, setMoreOpen] = useState(Boolean(question.hint || question.explanation || question.image_url))
  const entry = catalogEntry(question.type)
  const issues = questionIssues(question)
  const isInfo = question.type === 'info'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PaletteIcon type={question.type} className="size-10" />
        <div>
          <h2 className="font-extrabold">{entry.label}</h2>
          <p className="text-xs text-muted-foreground">{entry.description}</p>
        </div>
      </div>

      {issues.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {issues.map((issue) => (
            <li key={issue}>• {issue}</li>
          ))}
        </ul>
      )}

      <FormField id="prompt" label={isInfo ? 'Besedilo' : 'Navodilo / besedilo naloge'}>
        <Textarea
          id="prompt"
          value={question.prompt}
          rows={isInfo ? 5 : 3}
          maxLength={2000}
          onChange={(event) => onChange({ ...question, prompt: event.target.value })}
        />
      </FormField>

      <TypeEditor question={question} onChange={onChange} />

      {!isInfo && (
        <FormField
          id="points"
          label={isGenerator(question.type) ? 'Točke za vsak račun' : 'Točke'}
          hint={isGenerator(question.type) ? 'Skupno: točke × število računov.' : undefined}
        >
          <NumberField
            id="points"
            integer
            className="w-28"
            value={question.points}
            onValueChange={(value) => onChange({ ...question, points: Math.min(100, Math.max(0, value ?? 0)) })}
          />
        </FormField>
      )}

      <div className="rounded-xl border">
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold"
        >
          {isInfo ? 'Slika' : 'Namig, razlaga in slika'}
          <ChevronDown className={cn('size-4 transition', moreOpen && 'rotate-180')} />
        </button>
        {moreOpen && (
          <div className="space-y-3 border-t p-3">
            {!isInfo && (
              <>
                <FormField id="hint" label="Namig" hint="Učenec ga lahko odpre med reševanjem.">
                  <Input
                    id="hint"
                    value={question.hint ?? ''}
                    maxLength={500}
                    onChange={(event) => onChange({ ...question, hint: event.target.value || null })}
                  />
                </FormField>
                <FormField id="explanation" label="Razlaga" hint="Prikaže se po oddaji, pri pregledu rešitev.">
                  <Textarea
                    id="explanation"
                    rows={2}
                    value={question.explanation ?? ''}
                    maxLength={1000}
                    onChange={(event) => onChange({ ...question, explanation: event.target.value || null })}
                  />
                </FormField>
              </>
            )}
            <FormField id="image_url" label="Povezava do slike (neobvezno)">
              <Input
                id="image_url"
                type="url"
                placeholder="https://…"
                value={question.image_url ?? ''}
                maxLength={500}
                onChange={(event) => onChange({ ...question, image_url: event.target.value || null })}
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  )
}

function TypeEditor({ question, onChange }: QuestionEditorProps) {
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice':
      return <ChoiceEditor question={question} onChange={onChange} />
    case 'true_false':
      return <TrueFalseEditor question={question} onChange={onChange} />
    case 'numeric':
      return <NumericEditor question={question} onChange={onChange} />
    default:
      return null
  }
}
