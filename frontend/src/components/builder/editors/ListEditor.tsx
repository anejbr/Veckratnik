import { ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ListEditorProps = {
  values: string[]
  onChange: (values: string[]) => void
  placeholder: (index: number) => string
  addLabel: string
  min?: number
  max?: number
  sortable?: boolean
}

/** Urejanje seznama kratkih besedil (sprejeti odgovori, elementi za razvrščanje …). */
export function ListEditor({ values, onChange, placeholder, addLabel, min = 1, max = 10, sortable }: ListEditorProps) {
  const set = (index: number, value: string) => onChange(values.map((v, i) => (i === index ? value : v)))
  const move = (from: number, to: number) => {
    const next = [...values]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {values.map((value, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {sortable && (
              <span className="w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">{index + 1}.</span>
            )}
            <Input value={value} onChange={(event) => set(index, event.target.value)} placeholder={placeholder(index)} />
            {sortable && (
              <>
                <Button variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Gor">
                  <ChevronUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === values.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label="Dol"
                >
                  <ChevronDown />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={values.length <= min}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              aria-label="Odstrani"
            >
              <Trash />
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" disabled={values.length >= max} onClick={() => onChange([...values, ''])}>
        <Plus /> {addLabel}
      </Button>
    </div>
  )
}
