import { useDraggable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'

import { CATALOG_GROUPS, QUESTION_CATALOG, catalogEntry } from '@/lib/question-catalog'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/types/questions'

type ElementPaletteProps = {
  onAdd: (type: QuestionType) => void
}

const TYPES = Object.keys(QUESTION_CATALOG) as QuestionType[]

export function ElementPalette({ onAdd }: ElementPaletteProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-extrabold">Elementi</h2>
        <p className="text-xs text-muted-foreground">Klikni ali povleci na platno.</p>
      </div>
      {CATALOG_GROUPS.map((group) => (
        <div key={group} className="space-y-1.5">
          <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{group}</h3>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
            {TYPES.filter((type) => catalogEntry(type).group === group).map((type) => (
              <PaletteItem key={type} type={type} onAdd={onAdd} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PaletteItem({ type, onAdd }: { type: QuestionType; onAdd: (type: QuestionType) => void }) {
  const entry = catalogEntry(type)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { from: 'palette', type },
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onAdd(type)}
      className={cn(
        'group flex w-full min-w-0 touch-none items-center gap-2.5 rounded-xl border bg-card p-2 text-left transition hover:border-primary/40 hover:shadow-sm',
        isDragging && 'opacity-40',
      )}
      {...attributes}
      {...listeners}
    >
      <PaletteIcon type={type} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{entry.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{entry.description}</span>
      </span>
      <Plus className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </button>
  )
}

export function PaletteIcon({ type, className }: { type: QuestionType; className?: string }) {
  const entry = catalogEntry(type)
  return (
    <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', entry.tone, className)}>
      <entry.icon className="size-4" />
    </span>
  )
}
