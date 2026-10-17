/** Slovenska množina: 1 naloga, 2 nalogi, 3 naloge, 5 nalog. */
export function plural(count: number, forms: [string, string, string, string]): string {
  const mod = Math.abs(count) % 100
  const form = mod === 1 ? forms[0] : mod === 2 ? forms[1] : mod === 3 || mod === 4 ? forms[2] : forms[3]
  return `${count} ${form}`
}

export const taskWord = (count: number) => plural(count, ['naloga', 'nalogi', 'naloge', 'nalog'])

/** 75 → "1 min 15 s" */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null) return '–'
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  if (hours) return `${hours} h ${minutes} min`
  if (minutes) return rest ? `${minutes} min ${rest} s` : `${minutes} min`
  return `${rest} s`
}

/** 75 → "01:15" (za časovnik) */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

const dateFormatter = new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'numeric', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('sl-SI', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso))

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '–'
  return `${Math.round(value)} %`
}
