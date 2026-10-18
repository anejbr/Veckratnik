import type { QuestionDraft, QuizDraft } from '@/types/questions'

/** Vrne seznam težav naloge (prazen seznam = naloga je v redu). */
export function questionIssues(q: QuestionDraft): string[] {
  const issues: string[] = []
  const needsPrompt = q.type !== 'fill_blank' && q.type !== 'compare'
  if (needsPrompt && !q.prompt.trim()) issues.push('Manjka besedilo naloge.')

  switch (q.type) {
    case 'single_choice':
    case 'multiple_choice': {
      if (q.options.length < 2) issues.push('Dodaj vsaj dve možnosti.')
      if (q.options.some((o) => !o.text.trim())) issues.push('Nekatere možnosti so prazne.')
      const ids = new Set(q.options.map((o) => o.id))
      const correct = q.type === 'single_choice' ? [q.correct] : q.correct
      if (correct.length === 0 || correct.some((id) => !ids.has(id))) issues.push('Označi pravilen odgovor.')
      break
    }
    case 'numeric':
      if (!Number.isFinite(q.answer)) issues.push('Vpiši pravilen rezultat.')
      break
    case 'short_text':
      if (q.accepted.filter((a) => a.trim()).length === 0) issues.push('Vpiši vsaj en sprejet odgovor.')
      break
    case 'fill_blank': {
      const blanks = q.template.split('{}').length - 1
      if (blanks === 0) issues.push('V predlogo vstavi vsaj eno prazno mesto {}.')
      if (blanks !== q.answers.length) issues.push('Vsako prazno mesto potrebuje odgovor.')
      if (q.answers.some((a) => !a.trim())) issues.push('Nekateri odgovori so prazni.')
      break
    }
    case 'compare':
      if (!q.left.trim() || !q.right.trim()) issues.push('Vpiši oba izraza.')
      break
    case 'ordering':
      if (q.items.filter((i) => i.trim()).length < 2) issues.push('Dodaj vsaj dva elementa.')
      break
    case 'matching':
      if (q.pairs.length < 2) issues.push('Dodaj vsaj dva para.')
      if (q.pairs.some((p) => !p.left.trim() || !p.right.trim())) issues.push('Nekateri pari so prazni.')
      break
    case 'multiples_grid':
      if (q.mode === 'multiples' && q.range_from >= q.range_to) issues.push('Razpon števil ni pravilen.')
      if (q.mode === 'multiples' && q.range_to - q.range_from > 99) issues.push('Mreža ima lahko največ 100 števil.')
      break
    case 'times_table':
      if (q.factors.length === 0) issues.push('Izberi vsaj eno število poštevanke.')
      break
    case 'arithmetic':
      if (q.operations.length === 0) issues.push('Izberi vsaj eno računsko operacijo.')
      if (q.min_value >= q.max_value) issues.push('Najmanjše število mora biti manjše od največjega.')
      break
  }
  return issues
}

export function quizIssues(draft: QuizDraft): string[] {
  const issues: string[] = []
  if (draft.title.trim().length < 3) issues.push('Naslov kviza naj ima vsaj 3 znake.')
  if (draft.status === 'published' && !draft.questions.some((q) => q.type !== 'info')) {
    issues.push('Objavljen kviz mora imeti vsaj eno nalogo.')
  }
  if (draft.access_code && draft.access_code.trim().length < 4) issues.push('Koda za zaklep naj ima vsaj 4 znake.')
  draft.questions.forEach((q, i) => {
    const problems = questionIssues(q)
    if (problems.length) issues.push(`Naloga ${i + 1}: ${problems[0]}`)
  })
  return issues
}
