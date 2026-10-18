import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MousePointerClick } from 'lucide-react'

import { QuestionTile } from '@/components/builder/QuestionTile'
import type { QuizDraftApi } from '@/components/builder/useQuizDraft'
import { cn } from '@/lib/utils'

export const CANVAS_ID = 'canvas'

export function QuestionCanvas({ draft }: { draft: QuizDraftApi }) {
  const { state, selectedKey, setSelectedKey, duplicateQuestion, removeQuestion } = draft
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_ID })

  let counter = 0
  const numbers = state.questions.map((q) => (q.type === 'info' ? null : ++counter))

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-72 rounded-3xl border-2 border-dashed p-3 transition-colors sm:p-4',
        isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
      )}
    >
      {state.questions.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <MousePointerClick className="size-10" />
          <p className="font-bold text-foreground">Platno je prazno</p>
          <p className="max-w-xs text-sm">Izberi element v paleti ali ga povleci sem. Vrstni red lahko kasneje spremeniš.</p>
        </div>
      ) : (
        <SortableContext items={state.questions.map((q) => q.key)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {state.questions.map((question, index) => (
              <QuestionTile
                key={question.key}
                question={question}
                number={numbers[index]}
                selected={question.key === selectedKey}
                onSelect={() => setSelectedKey(question.key)}
                onDuplicate={() => duplicateQuestion(question.key)}
                onRemove={() => removeQuestion(question.key)}
              />
            ))}
          </ol>
        </SortableContext>
      )}
    </div>
  )
}
