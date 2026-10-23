import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { Search, X } from 'lucide-react'

import { useAuth } from '@/auth/auth-context'
import { QuizCard } from '@/components/quiz/QuizCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { QuizSummary, Tag } from '@/types/quiz'

const ALL_GRADES = 'vsi'
const VISIBLE_TAGS = 8

export function QuizListPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('iskanje') ?? '')
  const [allTags, setAllTags] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim())
  const tag = params.get('tag')
  const grade = params.get('razred')

  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const query = new URLSearchParams()
  if (debouncedSearch) query.set('search', debouncedSearch)
  if (tag) query.set('tag', tag)
  if (grade) query.set('grade', grade)

  const quizzes = useQuery({
    queryKey: ['quizzes', debouncedSearch, tag, grade],
    queryFn: () => api<QuizSummary[]>(`/quizzes?${query.toString()}`),
    placeholderData: (previous) => previous,
  })
  const tags = useQuery({ queryKey: ['tags'], queryFn: () => api<Tag[]>('/tags') })

  const hasFilters = Boolean(debouncedSearch || tag || grade)
  const firstName = user?.full_name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          {user?.role === 'teacher' ? 'Vsi kvizi' : `Živjo, ${firstName}! 👋`}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {user?.role === 'teacher'
            ? 'Objavljeni kvizi vseh učiteljev. Tudi ti jih lahko preizkusiš.'
            : 'Izberi kviz in pokaži, kaj znaš.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setParam('iskanje', event.target.value.trim() || null)
            }}
            placeholder="Išči kvize …"
            className="h-10 pl-9 text-base"
            aria-label="Išči kvize"
          />
        </div>
        <Select value={grade ?? ALL_GRADES} onValueChange={(v) => setParam('razred', v === ALL_GRADES ? null : v)}>
          <SelectTrigger className="h-10! w-full sm:w-44" aria-label="Razred">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_GRADES}>Vsi razredi</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
              <SelectItem key={g} value={String(g)}>
                {g}. razred
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tags.data && tags.data.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(allTags || tags.data.findIndex((t) => t.name === tag) >= VISIBLE_TAGS
            ? tags.data
            : tags.data.slice(0, VISIBLE_TAGS)
          ).map((t) => {
            const active = tag === t.name
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setParam('tag', active ? null : t.name)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                #{t.name} <span className="opacity-60">{t.quiz_count}</span>
              </button>
            )
          })}
          {tags.data.length > VISIBLE_TAGS && (
            <button
              type="button"
              onClick={() => setAllTags((v) => !v)}
              className="rounded-full px-3 py-1 text-sm font-semibold text-primary hover:underline"
            >
              {allTags ? 'Manj' : `Še ${tags.data.length - VISIBLE_TAGS} …`}
            </button>
          )}
        </div>
      )}

      {quizzes.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : quizzes.isError ? (
        <p className="py-12 text-center text-destructive">Kvizov ni bilo mogoče naložiti.</p>
      ) : quizzes.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-5xl">🔍</p>
          <p className="text-lg font-bold">{hasFilters ? 'Ni zadetkov' : 'Ni še nobenega kviza'}</p>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setParams({}, { replace: true })
              }}
            >
              <X /> Počisti filtre
            </Button>
          )}
        </div>
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', quizzes.isPlaceholderData && 'opacity-60')}>
          {quizzes.data.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  )
}
