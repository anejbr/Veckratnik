import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useBlocker, useNavigate } from 'react-router'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ElementPalette, PaletteIcon } from '@/components/builder/ElementPalette'
import { CANVAS_ID, QuestionCanvas } from '@/components/builder/QuestionCanvas'
import { QuestionEditor } from '@/components/builder/QuestionEditor'
import { toPayload, useQuizDraft } from '@/components/builder/useQuizDraft'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { plural, taskWord } from '@/lib/format'
import { catalogEntry, maxPoints } from '@/lib/question-catalog'
import { quizIssues } from '@/lib/question-validation'
import type { QuestionType, QuizDraft, TeacherQuizDetail } from '@/types/questions'

type QuizBuilderProps = {
  quizId?: number
  initial: QuizDraft | TeacherQuizDetail
}

export function QuizBuilder({ quizId, initial }: QuizBuilderProps) {
  const draft = useQuizDraft(initial)
  const { state, dirty, selectedKey, update, addQuestion, updateQuestion, moveQuestion, markSaved } = draft
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const allowNavigation = useRef(false)
  const [dragType, setDragType] = useState<QuestionType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !allowNavigation.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const save = useMutation({
    mutationFn: (payload: QuizDraft) =>
      quizId
        ? api<TeacherQuizDetail>(`/teacher/quizzes/${quizId}`, { method: 'PUT', body: payload })
        : api<TeacherQuizDetail>('/teacher/quizzes', { method: 'POST', body: payload }),
    onSuccess: (saved, payload) => {
      markSaved(saved, payload)
      queryClient.setQueryData(['teacher', 'quiz', saved.id], saved)
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', String(saved.id)] })
      toast.success(saved.status === 'published' ? 'Kviz je shranjen in objavljen.' : 'Osnutek je shranjen.')
      if (!quizId) {
        allowNavigation.current = true
        navigate(`/ucitelj/kvizi/${saved.id}/uredi`, { replace: true })
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const onSave = () => {
    const payload = toPayload(state)
    const issues = quizIssues(payload)
    if (issues.length) {
      toast.error(issues[0], { description: issues.length > 1 ? `in še ${issues.length - 1}` : undefined })
      return
    }
    save.mutate(payload)
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current as { from?: string; type?: QuestionType } | undefined
    setDragType(data?.from === 'palette' ? (data.type ?? null) : null)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragType(null)
    if (!over) return
    const data = active.data.current as { from?: string; type?: QuestionType } | undefined
    const indexOf = (id: unknown) => state.questions.findIndex((q) => q.key === id)
    if (data?.from === 'palette' && data.type) {
      const index = over.id === CANVAS_ID ? -1 : indexOf(over.id)
      addQuestion(data.type, index >= 0 ? index : undefined)
      return
    }
    const from = indexOf(active.id)
    const to = indexOf(over.id)
    if (from >= 0 && to >= 0 && from !== to) moveQuestion(from, to)
  }

  const selected = state.questions.find((q) => q.key === selectedKey)
  const tasks = state.questions.reduce(
    (sum, q) => sum + (q.type === 'info' ? 0 : 'count' in q ? q.count : 1),
    0,
  )
  const points = state.questions.reduce((sum, q) => sum + maxPoints(q), 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/ucitelj/kvizi"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Moji kvizi
        </Link>
        <span className="text-sm text-muted-foreground">
          {taskWord(tasks)} · {plural(points, ['točka', 'točki', 'točke', 'točk'])}
          {dirty && <span className="ml-2 font-semibold text-amber-700">● neshranjene spremembe</span>}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={state.status === 'published'}
              onCheckedChange={(checked) => update('status', checked ? 'published' : 'draft')}
            />
            <Label htmlFor="published" className="font-semibold">
              Objavljen
            </Label>
          </div>
          {quizId && (
            <Button asChild variant="outline">
              <Link to={`/kvizi/${quizId}`}>
                <Eye /> Odpri
              </Link>
            </Button>
          )}
          <Button onClick={onSave} disabled={save.isPending}>
            <Save /> {save.isPending ? 'Shranjujem …' : 'Shrani'}
          </Button>
        </div>
      </div>

      <input
        value={state.title}
        onChange={(event) => update('title', event.target.value)}
        placeholder="Naslov kviza"
        maxLength={150}
        aria-label="Naslov kviza"
        className="w-full rounded-xl bg-transparent px-1 text-3xl font-black tracking-tight outline-none placeholder:text-muted-foreground/50 focus:bg-card focus:ring-2 focus:ring-ring/40"
      />

      <Tabs defaultValue="naloge" className="gap-4">
        <TabsList>
          <TabsTrigger value="naloge">Naloge</TabsTrigger>
        </TabsList>

        <TabsContent value="naloge">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDragType(null)}
          >
            <div className="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_22rem]">
              <aside className="rounded-3xl border bg-card p-4 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto">
                <ElementPalette onAdd={(type) => addQuestion(type)} />
              </aside>

              <QuestionCanvas draft={draft} />

              <aside className="rounded-3xl border bg-card p-4 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto">
                {selected ? (
                  <QuestionEditor
                    key={selected.key}
                    question={selected}
                    onChange={(question) => updateQuestion(selected.key, question)}
                  />
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Izberi nalogo na platnu, da jo urediš.
                  </p>
                )}
              </aside>
            </div>

            <DragOverlay dropAnimation={null}>
              {dragType && (
                <div className="flex w-56 items-center gap-2 rounded-xl border bg-card p-2 shadow-xl">
                  <PaletteIcon type={dragType} />
                  <span className="text-sm font-bold">{catalogEntry(dragType).label}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.reset?.()}
        title="Zapustim brez shranjevanja?"
        description="Spremembe kviza še niso shranjene in bodo izgubljene."
        confirmLabel="Zapusti"
        destructive
        onConfirm={() => blocker.proceed?.()}
      />
    </div>
  )
}
