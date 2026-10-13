import { Link } from 'react-router'

import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 font-extrabold tracking-tight', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-primary-foreground shadow-sm">
        ×
      </span>
      <span className="text-xl">Večkratnik</span>
    </Link>
  )
}
