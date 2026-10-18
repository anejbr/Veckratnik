import { OPERATION_SYMBOLS } from '@/lib/question-catalog'
import type { ArithmeticDraft, Item, TimesTableDraft } from '@/types/questions'

export type GeneratedItem = Item & { answer: number }

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const pick = <T,>(values: T[]): T => values[Math.floor(Math.random() * values.length)]

/** Vzorec računov poštevanke za predogled (strežnik ob reševanju generira svoje). */
export function sampleTimesTable(q: TimesTableDraft): GeneratedItem[] {
  if (q.factors.length === 0) return []
  return Array.from({ length: q.count }, (_, i) => {
    const factor = pick(q.factors)
    const multiplier = randInt(1, q.max_multiplier)
    const op = q.operation === 'mixed' ? pick(['multiply', 'divide'] as const) : q.operation
    const id = `p${i}`
    return op === 'multiply'
      ? { id, text: `${multiplier} · ${factor}`, answer: multiplier * factor }
      : { id, text: `${multiplier * factor} : ${factor}`, answer: multiplier }
  })
}

export function sampleArithmetic(q: ArithmeticDraft): GeneratedItem[] {
  if (q.operations.length === 0 || q.min_value >= q.max_value) return []
  const { min_value: min, max_value: max } = q
  return Array.from({ length: q.count }, (_, i) => {
    const op = pick(q.operations)
    const id = `p${i}`
    let a = randInt(min, max)
    let b = randInt(min, max)
    switch (op) {
      case '+':
        return { id, text: `${a} + ${b}`, answer: a + b }
      case '-':
        if (!q.allow_negative && b > a) [a, b] = [b, a]
        return { id, text: `${a} ${OPERATION_SYMBOLS['-']} ${b}`, answer: a - b }
      case '*':
        return { id, text: `${a} · ${b}`, answer: a * b }
      case ':': {
        const divisor = randInt(Math.max(1, min), Math.max(1, max))
        const quotient = randInt(Math.max(0, min), max)
        return { id, text: `${divisor * quotient} : ${divisor}`, answer: quotient }
      }
    }
  })
}
