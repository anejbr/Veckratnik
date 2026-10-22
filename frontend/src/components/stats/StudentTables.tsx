import { useState } from 'react'
import { ArrowDownUp, Eye, TimerOff } from 'lucide-react'

import { AttemptDetailDialog } from '@/components/stats/AttemptDetailDialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime, formatDuration, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { QuizStats } from '@/types/stats'

type Student = QuizStats['students'][number]
type SortKey = 'student_name' | 'attempts' | 'best_percent' | 'best_seconds' | 'last_finished_at'

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'student_name', label: 'Učenec' },
  { key: 'attempts', label: 'Poskusi', numeric: true },
  { key: 'best_percent', label: 'Najboljši rezultat', numeric: true },
  { key: 'best_seconds', label: 'Čas najboljšega', numeric: true },
  { key: 'last_finished_at', label: 'Zadnjič', numeric: true },
]

function compare(a: Student, b: Student, key: SortKey): number {
  const x = a[key]
  const y = b[key]
  if (typeof x === 'string' && typeof y === 'string') return x.localeCompare(y, 'sl')
  return Number(x ?? Infinity) - Number(y ?? Infinity)
}

function PercentCell({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </span>
      <span className="font-bold tabular-nums">{formatPercent(value)}</span>
    </span>
  )
}

export function StudentTables({ stats }: { stats: QuizStats }) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'student_name', desc: false })
  const [openAttempt, setOpenAttempt] = useState<number | null>(null)

  const students = [...stats.students].sort((a, b) => compare(a, b, sort.key) * (sort.desc ? -1 : 1))
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'student_name' }))

  return (
    <section className="rounded-3xl border bg-card p-5">
      <Tabs defaultValue="ucenci" className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-extrabold">Reševanja učencev</h3>
          <TabsList>
            <TabsTrigger value="ucenci">Učenci ({stats.students.length})</TabsTrigger>
            <TabsTrigger value="poskusi">Vsi poskusi ({stats.attempts.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ucenci">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableHead key={column.key} className={cn(column.numeric && 'text-right')}>
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1 font-bold hover:text-foreground',
                        sort.key === column.key && 'text-foreground',
                      )}
                    >
                      {column.label} <ArrowDownUp className="size-3 opacity-50" />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell className="font-semibold">
                    {student.student_name}
                    {student.grade && <span className="ml-1.5 text-xs text-muted-foreground">{student.grade}. r.</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{student.attempts}</TableCell>
                  <TableCell className="text-right">
                    <PercentCell value={student.best_percent} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatDuration(student.best_seconds)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatDateTime(student.last_finished_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="poskusi">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Učenec</TableHead>
                <TableHead className="text-right">Poskus</TableHead>
                <TableHead className="text-right">Rezultat</TableHead>
                <TableHead className="text-right">Čas</TableHead>
                <TableHead className="text-right">Oddano</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-semibold">{attempt.student_name}</TableCell>
                  <TableCell className="text-right tabular-nums">{attempt.attempt_number}.</TableCell>
                  <TableCell className="text-right">
                    <PercentCell value={attempt.percent} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      {attempt.timed_out && <TimerOff className="size-3.5 text-amber-600" aria-label="Čas je potekel" />}
                      {formatDuration(attempt.duration_seconds)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatDateTime(attempt.finished_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setOpenAttempt(attempt.id)}>
                      <Eye /> Odgovori
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <AttemptDetailDialog attemptId={openAttempt} onClose={() => setOpenAttempt(null)} />
    </section>
  )
}
