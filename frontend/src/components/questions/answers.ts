import type { Answer, QuestionView } from '@/types/questions'

/** Začetni odgovor (pri razvrščanju je to vrstni red, kot ga je učenec dobil). */
export function initialAnswer(question: QuestionView): Answer | undefined {
  if (question.type === 'ordering') return question.items.map((item) => item.id)
  return undefined
}

/** Ali je učenec na nalogo že odgovoril (za prikaz napredka). */
export function isAnswered(question: QuestionView, answer: Answer | undefined): boolean {
  if (question.type === 'info' || question.type === 'ordering') return true
  if (answer == null) return false
  if (typeof answer === 'string') return answer.trim() !== ''
  if (typeof answer === 'boolean') return true
  if (Array.isArray(answer)) {
    if (question.type === 'fill_blank') {
      const blanks = question.template.split('{}').length - 1
      return (answer as string[]).filter((a) => a?.trim()).length === blanks
    }
    return answer.length > 0
  }
  const filled = Object.values(answer).filter((v) => String(v).trim() !== '').length
  if (question.type === 'matching') return filled === question.left.length
  if (question.type === 'times_table' || question.type === 'arithmetic') return filled === question.items.length
  return filled > 0
}

/** Napredek naloge kot [rešeno, skupaj]; generator šteje vsak račun posebej. */
export function taskProgress(question: QuestionView, answer: Answer | undefined): [number, number] {
  if (question.type === 'info') return [0, 0]
  if (question.type === 'times_table' || question.type === 'arithmetic') {
    const filled = answer && typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {}
    const done = question.items.filter((item) => String(filled[item.id] ?? '').trim() !== '').length
    return [done, question.items.length]
  }
  return [isAnswered(question, answer) ? 1 : 0, 1]
}
