import { sampleArithmetic, sampleTimesTable } from '@/lib/generators'
import type { QuestionDraft, QuestionView } from '@/types/questions'

function shuffle<T>(values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Premeša tako, da vrstni red ni enak izvirnemu (če je to mogoče). */
function shuffleDifferent<T>(values: T[]): T[] {
  if (values.length < 2) return values
  for (let attempt = 0; attempt < 10; attempt++) {
    const shuffled = shuffle(values)
    if (shuffled.some((value, i) => value !== values[i])) return shuffled
  }
  return [...values.slice(1), values[0]]
}

/** Pretvori nalogo iz sandboxa v obliko, kot jo vidi učenec (za predogled). */
export function draftToView(q: QuestionDraft, id: string): QuestionView {
  const base = { id, prompt: q.prompt, points: q.points, hint: q.hint ?? null, image_url: q.image_url ?? null }
  switch (q.type) {
    case 'single_choice':
    case 'multiple_choice':
      return { ...base, type: q.type, options: q.options }
    case 'true_false':
    case 'short_text':
    case 'info':
      return { ...base, type: q.type }
    case 'numeric':
      return { ...base, type: 'numeric', unit: q.unit ?? null }
    case 'fill_blank':
      return { ...base, type: 'fill_blank', template: q.template }
    case 'compare':
      return { ...base, type: 'compare', left: q.left, right: q.right }
    case 'ordering':
      return {
        ...base,
        type: 'ordering',
        items: shuffleDifferent(q.items.map((text, i) => ({ id: `o${i}`, text }))),
        direction_label: q.direction_label,
      }
    case 'matching':
      return {
        ...base,
        type: 'matching',
        left: q.pairs.map((p, i) => ({ id: `l${i}`, text: p.left })),
        right: shuffle(q.pairs.map((p, i) => ({ id: `r${i}`, text: p.right }))),
      }
    case 'multiples_grid': {
      const from = q.mode === 'divisors' ? 1 : q.range_from
      const to = q.mode === 'divisors' ? q.number : q.range_to
      const numbers = to > from ? Array.from({ length: Math.min(100, to - from + 1) }, (_, i) => from + i) : []
      return { ...base, type: 'multiples_grid', mode: q.mode, number: q.number, numbers }
    }
    case 'times_table':
      return { ...base, type: 'times_table', items: sampleTimesTable(q).map(({ id, text }) => ({ id, text })) }
    case 'arithmetic':
      return { ...base, type: 'arithmetic', items: sampleArithmetic(q).map(({ id, text }) => ({ id, text })) }
  }
}
