import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

import { ChoiceInput } from '@/components/questions/inputs/ChoiceInput'
import { CompareInput } from '@/components/questions/inputs/CompareInput'
import { FillBlankInput } from '@/components/questions/inputs/FillBlankInput'
import { GeneratedItemsInput } from '@/components/questions/inputs/GeneratedItemsInput'
import { MatchingInput } from '@/components/questions/inputs/MatchingInput'
import { MultiplesGridInput } from '@/components/questions/inputs/MultiplesGridInput'
import { OrderingInput } from '@/components/questions/inputs/OrderingInput'
import { TextAnswerInput } from '@/components/questions/inputs/TextAnswerInput'
import { TrueFalseInput } from '@/components/questions/inputs/TrueFalseInput'
import { Badge } from '@/components/ui/badge'
import { plural } from '@/lib/format'
import { quizTheme } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'
import type { Answer, QuestionView } from '@/types/questions'

type QuestionCardProps = {
  question: QuestionView
  /** zaporedna številka naloge (info bloki je nimajo) */
  number?: number
  value: Answer | undefined
  onChange: (value: Answer) => void
  theme: string
  large?: boolean
  disabled?: boolean
}

export function QuestionCard({ question, number, value, onChange, theme, large, disabled }: QuestionCardProps) {
  const [showHint, setShowHint] = useState(false)
  const colors = quizTheme(theme)
  const isInfo = question.type === 'info'
  const isGenerator = question.type === 'times_table' || question.type === 'arithmetic'
  const totalPoints = isGenerator ? question.points * question.items.length : question.points

  return (
    <section className={cn('rounded-3xl border bg-card p-5 shadow-sm sm:p-7', isInfo && colors.soft, large && 'text-lg')}>
      {!isInfo && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={cn('text-sm font-black tracking-wide uppercase', colors.text)}>
            {number ? `Naloga ${number}` : 'Naloga'}
          </span>
          {totalPoints > 0 && (
            <Badge variant="secondary">{plural(totalPoints, ['točka', 'točki', 'točke', 'točk'])}</Badge>
          )}
        </div>
      )}

      {question.prompt && (
        <p className={cn('font-bold whitespace-pre-line', large ? 'text-2xl' : 'text-xl', isInfo && 'font-semibold')}>
          {question.prompt}
        </p>
      )}
      {question.image_url && (
        <img
          src={question.image_url}
          alt=""
          className="mt-4 max-h-72 rounded-2xl border object-contain"
          onError={(event) => (event.currentTarget.style.display = 'none')}
        />
      )}

      {!isInfo && (
        <div className="mt-5">
          <QuestionInput question={question} value={value} onChange={onChange} theme={theme} disabled={disabled} />
        </div>
      )}

      {question.hint && (
        <div className="mt-4">
          {showHint ? (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">
              <Lightbulb className="mt-0.5 size-4 shrink-0" /> {question.hint}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline"
            >
              <Lightbulb className="size-4" /> Pokaži namig
            </button>
          )}
        </div>
      )}
    </section>
  )
}

type QuestionInputProps = Omit<QuestionCardProps, 'number' | 'large'>

function QuestionInput({ question, value, onChange, theme, disabled }: QuestionInputProps) {
  const common = { value, onChange, disabled }
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice':
      return (
        <ChoiceInput {...common} options={question.options} multiple={question.type === 'multiple_choice'} theme={theme} />
      )
    case 'true_false':
      return <TrueFalseInput {...common} />
    case 'numeric':
      return <TextAnswerInput {...common} numeric unit={question.unit} />
    case 'short_text':
      return <TextAnswerInput {...common} numeric={false} />
    case 'fill_blank':
      return <FillBlankInput {...common} template={question.template} />
    case 'compare':
      return <CompareInput {...common} left={question.left} right={question.right} theme={theme} />
    case 'ordering':
      return <OrderingInput {...common} items={question.items} directionLabel={question.direction_label} />
    case 'matching':
      return <MatchingInput {...common} left={question.left} right={question.right} />
    case 'multiples_grid':
      return <MultiplesGridInput {...common} numbers={question.numbers} theme={theme} />
    case 'times_table':
    case 'arithmetic':
      return <GeneratedItemsInput {...common} items={question.items} />
    case 'info':
      return null
  }
}
