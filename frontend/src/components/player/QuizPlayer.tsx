import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Send, X } from 'lucide-react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Timer } from '@/components/player/Timer'
import { initialAnswer, isAnswered, taskProgress } from '@/components/questions/answers'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useNow } from '@/hooks/useNow'
import { api, errorMessage } from '@/lib/api'
import { quizTheme } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'
import type { AttemptResult, AttemptView } from '@/types/attempt'
import type { Answers } from '@/types/questions'

const storageKey = (id: number) => `veckratnik.odgovori.${id}`

function loadAnswers(attempt: AttemptView): Answers {
  const defaults: Answers = {}
  for (const question of attempt.questions) {
    const initial = initialAnswer(question)
    if (initial !== undefined) defaults[question.id] = initial
  }
  try {
    const saved = sessionStorage.getItem(storageKey(attempt.id))
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
  } catch {
    return defaults
  }
}

export function QuizPlayer({ attempt }: { attempt: AttemptView }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const colors = quizTheme(attempt.theme)
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers(attempt))
  const [index, setIndex] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const submitted = useRef(false)

  // razlika med uro strežnika in brskalnika, da štoparica ne laže
  const [clockOffset] = useState(() => Date.parse(attempt.server_time) - Date.now())
  const now = useNow(250)
  const elapsed = Math.max(0, (now + clockOffset - Date.parse(attempt.started_at)) / 1000)
  const limit = attempt.time_limit_seconds

  const numbered = useMemo(() => {
    let counter = 0
    return attempt.questions.map((q) => (q.type === 'info' ? undefined : ++counter))
  }, [attempt.questions])
  const [answeredCount, totalTasks] = attempt.questions.reduce(
    ([done, total], q) => {
      const [d, t] = taskProgress(q, answers[q.id])
      return [done + d, total + t]
    },
    [0, 0],
  )
  const unanswered = totalTasks - answeredCount

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(attempt.id), JSON.stringify(answers))
    } catch {
      // shramba ni na voljo – odgovori ostanejo le v pomnilniku
    }
  }, [answers, attempt.id])

  const submit = useMutation({
    mutationFn: () => api<AttemptResult>(`/attempts/${attempt.id}/submit`, { method: 'POST', body: { answers } }),
    onMutate: () => {
      submitted.current = true
    },
    onSuccess: (result) => {
      try {
        sessionStorage.removeItem(storageKey(attempt.id))
      } catch {
        // ni pomembno
      }
      queryClient.setQueryData(['attempt', String(attempt.id)], result)
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', String(attempt.quiz_id)] })
      queryClient.invalidateQueries({ queryKey: ['my-attempts'] })
      navigate(`/rezultati/${attempt.id}`, { replace: true })
    },
    onError: (error) => {
      submitted.current = false
      toast.error(errorMessage(error))
    },
  })

  // ob izteku časa kviz oddamo samodejno
  const timeUp = limit !== null && elapsed >= limit
  useEffect(() => {
    if (timeUp && !submitted.current) {
      toast.info('Čas je potekel – kviz je oddan.')
      submit.mutate()
    }
  }, [timeUp, submit])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => !submitted.current && currentLocation.pathname !== nextLocation.pathname,
  )

  const onSubmit = () => (unanswered > 0 ? setConfirmOpen(true) : submit.mutate())
  const oneByOne = attempt.layout === 'one_by_one'
  const large = attempt.font_size === 'large'
  const current = attempt.questions[index]
  const isLast = index === attempt.questions.length - 1

  const card = (questionIndex: number) => {
    const question = attempt.questions[questionIndex]
    return (
      <QuestionCard
        key={question.id}
        question={question}
        number={numbered[questionIndex]}
        value={answers[question.id]}
        onChange={(value) => setAnswers((a) => ({ ...a, [question.id]: value }))}
        theme={attempt.theme}
        large={large}
        disabled={submit.isPending}
      />
    )
  }

  return (
    <div className={cn('min-h-svh', colors.soft)}>
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/kvizi/${attempt.quiz_id}`)} aria-label="Zapusti kviz">
            <X />
          </Button>
          <span className="text-2xl">{attempt.emoji}</span>
          <h1 className="min-w-0 flex-1 truncate font-extrabold">{attempt.quiz_title}</h1>
          <Timer elapsed={elapsed} limit={limit} visible={attempt.show_timer} />
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
            <Progress value={totalTasks ? (100 * answeredCount) / totalTasks : 100} className="h-2 flex-1" />
            {answeredCount}/{totalTasks}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {oneByOne ? (
          <>
            {current && card(index)}
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="lg" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                <ArrowLeft /> Nazaj
              </Button>
              {isLast ? (
                <Button size="lg" className={cn('h-11 px-6 text-base', colors.solid)} onClick={onSubmit} disabled={submit.isPending}>
                  <Send /> Oddaj
                </Button>
              ) : (
                <Button size="lg" className={cn('h-11 px-6 text-base', colors.solid)} onClick={() => setIndex((i) => i + 1)}>
                  Naprej <ArrowRight />
                </Button>
              )}
            </div>
            <nav className="flex flex-wrap justify-center gap-1.5 pt-2" aria-label="Naloge">
              {attempt.questions.map((question, i) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={numbered[i] ? `Naloga ${numbered[i]}` : 'Besedilo'}
                  aria-current={i === index}
                  className={cn(
                    'grid size-8 place-items-center rounded-full text-xs font-bold transition',
                    i === index
                      ? colors.solid
                      : isAnswered(question, answers[question.id])
                        ? 'bg-card text-foreground shadow-sm'
                        : 'border-2 border-dashed border-foreground/20 text-muted-foreground',
                  )}
                >
                  {numbered[i] ?? 'i'}
                </button>
              ))}
            </nav>
          </>
        ) : (
          <>
            {attempt.questions.map((_, i) => card(i))}
            <div className="flex justify-end">
              <Button size="lg" className={cn('h-12 px-8 text-base', colors.solid)} onClick={onSubmit} disabled={submit.isPending}>
                <Send /> Oddaj kviz
              </Button>
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Oddam kviz?"
        description={`Neodgovorjenih nalog: ${unanswered} (od ${totalTasks}). Po oddaji odgovorov ne moreš več spreminjati.`}
        confirmLabel="Oddaj"
        pending={submit.isPending}
        onConfirm={() => {
          setConfirmOpen(false)
          submit.mutate()
        }}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.reset?.()}
        title="Zapustim kviz?"
        description="Odgovori ostanejo shranjeni v tem brskalniku, štoparica pa teče naprej. Kviz lahko kasneje oddaš."
        confirmLabel="Zapusti"
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  )
}
