import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Answer, Item } from '@/types/questions'

type OrderingInputProps = {
  items: Item[]
  directionLabel: string
  value: Answer | undefined
  onChange: (value: Answer) => void
  disabled?: boolean
}

export function OrderingInput({ items, directionLabel, value, onChange, disabled }: OrderingInputProps) {
  const order = Array.isArray(value) && value.length === items.length ? (value as string[]) : items.map((i) => i.id)
  const byId = new Map(items.map((item) => [item.id, item]))
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return
    onChange(arrayMove(order, from, to))
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    move(order.indexOf(String(active.id)), order.indexOf(String(over.id)))
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">Razvrsti {directionLabel}.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2 sm:max-w-md">
            {order.map((id, index) => (
              <SortableRow
                key={id}
                id={id}
                index={index}
                text={byId.get(id)?.text ?? ''}
                last={index === order.length - 1}
                disabled={disabled}
                onMove={move}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  )
}

type SortableRowProps = {
  id: string
  index: number
  text: string
  last: boolean
  disabled?: boolean
  onMove: (from: number, to: number) => void
}

function SortableRow({ id, index, text, last, disabled, onMove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border-2 bg-card p-3 text-xl font-bold',
        isDragging && 'z-10 shadow-lg ring-2 ring-primary/40',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Premakni"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <span className="grid size-7 place-items-center rounded-full bg-muted text-sm text-muted-foreground">
        {index + 1}
      </span>
      <span className="flex-1">{text}</span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={disabled || index === 0}
          onClick={() => onMove(index, index - 1)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Gor"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          disabled={disabled || last}
          onClick={() => onMove(index, index + 1)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Dol"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </li>
  )
}
