import { cn } from '@/lib/utils'

type SegmentedProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
}

export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1', className)} role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition',
            value === option.value ? 'bg-card text-foreground shadow-sm' : 'hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
