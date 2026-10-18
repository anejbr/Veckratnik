import { useRef } from 'react'
import { Plus } from 'lucide-react'

import type { EditorProps } from '@/components/builder/editors/types'
import { FormField } from '@/components/form/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function FillBlankEditor({ question, onChange }: EditorProps<'fill_blank'>) {
  const templateRef = useRef<HTMLInputElement>(null)

  const setTemplate = (template: string) => {
    const blanks = template.split('{}').length - 1
    const answers = Array.from({ length: blanks }, (_, i) => question.answers[i] ?? '')
    onChange({ ...question, template, answers })
  }

  const insertBlank = () => {
    const input = templateRef.current
    const start = input?.selectionStart ?? question.template.length
    const end = input?.selectionEnd ?? start
    setTemplate(question.template.slice(0, start) + '{}' + question.template.slice(end))
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + 2, start + 2)
    })
  }

  return (
    <div className="space-y-3">
      <FormField id="template" label="Račun s praznimi mesti" hint="Prazno mesto označi z {} – npr. 7 · {} = 56.">
        <div className="flex gap-2">
          <Input
            id="template"
            ref={templateRef}
            value={question.template}
            onChange={(event) => setTemplate(event.target.value)}
            className="font-mono"
          />
          <Button variant="outline" onClick={insertBlank} className="shrink-0">
            <Plus /> {'{}'}
          </Button>
        </div>
      </FormField>
      {question.answers.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {question.answers.map((answer, index) => (
            <FormField key={index} id={`blank-${index}`} label={`${index + 1}. prazno mesto`}>
              <Input
                id={`blank-${index}`}
                value={answer}
                onChange={(event) =>
                  onChange({ ...question, answers: question.answers.map((a, i) => (i === index ? event.target.value : a)) })
                }
              />
            </FormField>
          ))}
        </div>
      )}
    </div>
  )
}
