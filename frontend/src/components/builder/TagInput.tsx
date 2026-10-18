import { useState, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import type { Tag } from '@/types/quiz'

const normalize = (tag: string) => tag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, ' ').slice(0, 40)

export function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState('')
  const tags = useQuery({ queryKey: ['tags'], queryFn: () => api<Tag[]>('/tags') })

  const add = (raw: string) => {
    const tag = normalize(raw)
    if (tag && !value.includes(tag) && value.length < 10) onChange([...value, tag])
    setText('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      add(text)
    } else if (event.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const query = normalize(text)
  const suggestions = (tags.data ?? [])
    .map((t) => t.name)
    .filter((name) => !value.includes(name) && (!query || name.includes(query)))
    .slice(0, 8)

  return (
    <div className="space-y-2">
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-background p-1.5 focus-within:ring-3 focus-within:ring-ring/50">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">
            #{tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Odstrani ${tag}`}>
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => text && add(text)}
          placeholder={value.length ? '' : 'npr. poštevanka, 3. razred'}
          className="h-7 min-w-32 flex-1 border-0 p-1 shadow-none focus-visible:ring-0"
          aria-label="Dodaj tag"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Predlogi:</span>
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => add(name)}
              className="rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              #{name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
