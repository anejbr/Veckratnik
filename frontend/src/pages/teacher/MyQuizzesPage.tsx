import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { Copy, Ellipsis, Eye, Pencil, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AccessCodeChip } from '@/components/quiz/AccessCodeChip'
import { QuizCover } from '@/components/quiz/QuizCover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { formatDate, plural, taskWord } from '@/lib/format'
import type { TeacherQuizDetail } from '@/types/questions'
import type { TeacherQuizSummary } from '@/types/quiz'

export function MyQuizzesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [toDelete, setToDelete] = useState<TeacherQuizSummary | null>(null)

  const quizzes = useQuery({
    queryKey: ['teacher', 'quizzes'],
    queryFn: () => api<TeacherQuizSummary[]>('/teacher/quizzes'),
  })

  const duplicate = useMutation({
    mutationFn: (id: number) => api<TeacherQuizDetail>(`/teacher/quizzes/${id}/duplicate`, { method: 'POST' }),
    onSuccess: (copy) => {
      toast.success('Kviz je podvojen.')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] })
      navigate(`/ucitelj/kvizi/${copy.id}/uredi`)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (id: number) => api<void>(`/teacher/quizzes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Kviz je izbrisan.')
      setToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Moji kvizi</h1>
          <p className="mt-1 text-muted-foreground">Sestavljaj kvize, jih zakleni s kodo in spremljaj rezultate.</p>
        </div>
        <Button asChild size="lg" className="h-11 px-5 text-base">
          <Link to="/ucitelj/kvizi/nov">
            <Plus /> Nov kviz
          </Link>
        </Button>
      </div>

      {quizzes.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : quizzes.isError ? (
        <p className="text-destructive">{errorMessage(quizzes.error)}</p>
      ) : quizzes.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
          <p className="text-5xl">✏️</p>
          <p className="text-lg font-bold">Še nimaš nobenega kviza</p>
          <p className="max-w-sm text-muted-foreground">
            V sandboxu izberi vrste nalog, nastavi videz in objavi kviz za svoje učence.
          </p>
          <Button asChild className="mt-2">
            <Link to="/ucitelj/kvizi/nov">
              <Plus /> Ustvari prvi kviz
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {quizzes.data.map((quiz) => (
            <li key={quiz.id} className="flex items-center gap-4 rounded-2xl border bg-card p-3 pr-4 shadow-sm">
              <QuizCover theme={quiz.theme} emoji={quiz.emoji} className="size-16 shrink-0 rounded-xl text-3xl" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/ucitelj/kvizi/${quiz.id}/uredi`} className="truncate text-lg font-extrabold hover:text-primary">
                    {quiz.title}
                  </Link>
                  {quiz.status === 'published' ? (
                    <Badge className="bg-success text-white">Objavljen</Badge>
                  ) : (
                    <Badge variant="outline">Osnutek</Badge>
                  )}
                  {quiz.access_code && <AccessCodeChip code={quiz.access_code} />}
                </div>
                <p className="flex flex-wrap gap-x-3 text-xs font-semibold text-muted-foreground">
                  <span>{taskWord(quiz.question_count)}</span>
                  <span>{plural(quiz.attempt_count, ['reševanje', 'reševanji', 'reševanja', 'reševanj'])}</span>
                  {quiz.grade && <span>{quiz.grade}. razred</span>}
                  <span>posodobljeno {formatDate(quiz.updated_at)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Link to={`/ucitelj/kvizi/${quiz.id}/uredi`}>
                    <Pencil /> Uredi
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Več možnosti">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link to={`/ucitelj/kvizi/${quiz.id}/uredi`}>
                        <Pencil /> Uredi
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/kvizi/${quiz.id}`}>
                        <Eye /> Odpri kot učenec
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => duplicate.mutate(quiz.id)}>
                      <Copy /> Podvoji
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(quiz)}>
                      <Trash /> Izbriši
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Izbrišem kviz?"
        description={
          <>
            Kviz <strong>{toDelete?.title}</strong> in vsi rezultati učencev bodo trajno izbrisani.
          </>
        }
        confirmLabel="Izbriši"
        destructive
        pending={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  )
}
