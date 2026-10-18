import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CircleAlert, Copy, GripVertical, Trash } from 'lucide-react'

import { PaletteIcon } from '@/components/builder/ElementPalette'
import type { BuilderQuestion } from '@/components/builder/useQuizDraft'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { plural } from '@/lib/format'
import { catalogEntry, maxPoints } from '@/lib/question-catalog'
import { questionIssues } from '@/lib/question-validation'
import { cn } from '@/lib/utils'

type QuestionTileProps = {
  question: BuilderQuestion
  number: number | null
  selected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
}

function summary(question: BuilderQuestion): string {
  switch (question.type) {
    case 'fill_blank':
      return question.template.replaceAll('{}', '___')
    case 'compare':
      return `${question.left}  ?  ${question.right}`
    case 'times_table':
      return `Poštevanka ${question.factors.join(', ')} · ${question.count} računov`
    case 'arithmetic':
      return `${question.operations.join(' ')} od ${question.min_value} do ${question.max_value} · ${question.count} računov`
    default:
      return question.prompt
  }
}

export function QuestionTile({ question, number, selected, onSelect, onDuplicate, onRemove }: QuestionTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.key })
  const issues = questionIssues(question)
  const points = maxPoints(question)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl border-2 bg-card p-3 transition',
        selected ? 'border-primary shadow-md' : 'border-transparent shadow-sm ring-1 ring-border hover:ring-primary/30',
        isDragging && 'z-20 opacity-80 shadow-xl',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Premakni nalogo"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <PaletteIcon type={question.type} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            {number ? `${number}. ` : ''}
            {catalogEntry(question.type).label}
            {points > 0 && <span>· {plural(points, ['točka', 'točki', 'točke', 'točk'])}</span>}
          </span>
          <span className="block truncate font-semibold">{summary(question) || <em className="text-muted-foreground">brez besedila</em>}</span>
        </span>
      </button>

      {issues.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleAlert className="size-5 shrink-0 text-destructive" aria-label="Naloga ni dokončana" />
          </TooltipTrigger>
          <TooltipContent>{issues[0]}</TooltipContent>
        </Tooltip>
      )}

      <div className="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button variant="ghost" size="icon-sm" onClick={onDuplicate} aria-label="Podvoji">
          <Copy />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Izbriši" className="hover:text-destructive">
          <Trash />
        </Button>
      </div>
    </li>
  )
}
