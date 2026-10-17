import { ArrowRight } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Answer, Item } from '@/types/questions'

type MatchingInputProps = {
  left: Item[]
  right: Item[]
  value: Answer | undefined
  onChange: (value: Answer) => void
  disabled?: boolean
}

export function MatchingInput({ left, right, value, onChange, disabled }: MatchingInputProps) {
  const pairs = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, string>) : {}
  const used = new Set(Object.values(pairs))

  return (
    <div className="space-y-2 sm:max-w-lg">
      {left.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-2xl border-2 bg-card p-3">
          <span className="min-w-0 flex-1 text-xl font-bold">{item.text}</span>
          <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
          <Select
            value={pairs[item.id] ?? ''}
            onValueChange={(rightId) => onChange({ ...pairs, [item.id]: rightId })}
            disabled={disabled}
          >
            <SelectTrigger className="h-11! w-36 text-lg font-bold" aria-label={`Par za ${item.text}`}>
              <SelectValue placeholder="Izberi" />
            </SelectTrigger>
            <SelectContent>
              {right.map((option) => (
                <SelectItem key={option.id} value={option.id} className="text-base">
                  {option.text}
                  {used.has(option.id) && pairs[item.id] !== option.id && (
                    <span className="text-xs text-muted-foreground">(že izbrano)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}
