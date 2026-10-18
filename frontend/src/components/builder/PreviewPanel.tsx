import { useMemo, useState } from 'react'
import { Dices, Eye } from 'lucide-react'

import type { QuizDraftApi } from '@/components/builder/useQuizDraft'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { QuizCover } from '@/components/quiz/QuizCover'
import { Button } from '@/components/ui/button'
import { draftToView } from '@/lib/preview'
import type { Answers } from '@/types/questions'

export function PreviewPanel({ draft }: { draft: QuizDraftApi }) {
  const { state } = draft
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  const views = useMemo(
    () => state.questions.map((q) => draftToView(q, `${q.key}-${round}`)),
    [state.questions, round],
  )

  let counter = 0
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
        <span className="flex items-center gap-2">
          <Eye className="size-4" /> Predogled – tako učenec vidi kviz. Odgovori se ne shranijo.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRound((r) => r + 1)
            setAnswers({})
          }}
        >
          <Dices /> Nove naloge
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card">
        <QuizCover theme={state.settings.theme} emoji={state.settings.emoji} className="h-32 text-6xl" />
        <div className="p-5">
          <h2 className="text-2xl font-black">{state.title || 'Naslov kviza'}</h2>
          {state.description && <p className="mt-1 whitespace-pre-line text-muted-foreground">{state.description}</p>}
        </div>
      </div>

      {views.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Kviz še nima nalog.</p>
      ) : (
        views.map((view) => (
          <QuestionCard
            key={view.id}
            question={view}
            number={view.type === 'info' ? undefined : ++counter}
            value={answers[view.id]}
            onChange={(value) => setAnswers((a) => ({ ...a, [view.id]: value }))}
            theme={state.settings.theme}
            large={state.settings.font_size === 'large'}
          />
        ))
      )}
    </div>
  )
}
