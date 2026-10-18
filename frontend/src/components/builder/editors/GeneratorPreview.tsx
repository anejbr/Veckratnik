import { useState } from 'react'
import { Dices } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { GeneratedItem } from '@/lib/generators'

/** Nekaj primerov računov, ki jih bo generator ustvaril. */
export function GeneratorPreview({ generate }: { generate: () => GeneratedItem[] }) {
  const [, setSeed] = useState(0)
  const items = generate().slice(0, 6)
  if (items.length === 0) return null
  return (
    <div className="space-y-2 rounded-xl bg-muted/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase">Primeri računov</p>
        <Button variant="ghost" size="xs" onClick={() => setSeed((s) => s + 1)}>
          <Dices /> Novi
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-1 text-sm font-bold tabular-nums">
        {items.map((item) => (
          <li key={item.id}>
            {item.text} = <span className="text-success">{item.answer}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
