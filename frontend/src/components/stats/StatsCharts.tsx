import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatDate } from '@/lib/format'
import type { QuizStats } from '@/types/stats'

const countConfig = { count: { label: 'Poskusi', color: 'var(--chart-1)' } } satisfies ChartConfig
const successConfig = { average: { label: 'Povprečje točk', color: 'var(--chart-1)' } } satisfies ChartConfig

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card p-5">
      <h3 className="font-extrabold">{title}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      {children}
    </section>
  )
}

export function DistributionChart({ data }: { data: QuizStats['distribution'] }) {
  return (
    <ChartCard title="Porazdelitev rezultatov" description="Koliko poskusov je doseglo posamezen razpon točk.">
      <ChartContainer config={countConfig} className="aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ top: 16, left: -16, right: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <ChartTooltip cursor={{ fillOpacity: 0.5 }} content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export function QuestionSuccessChart({ data }: { data: QuizStats['questions'] }) {
  const rows = data.map((q) => ({
    name: `${q.position}. ${q.label}`,
    short: `${q.position}. ${q.label.length > 16 ? `${q.label.slice(0, 15).trimEnd()}…` : q.label}`,
    average: q.average_percent ?? 0,
    success: q.success_rate ?? 0,
  }))
  return (
    <ChartCard
      title="Uspešnost po nalogah"
      description="Povprečen delež doseženih točk pri vsaki nalogi. Ob prehodu z miško: delež popolnoma pravilnih rešitev."
    >
      <ChartContainer config={successConfig} className="aspect-auto w-full" style={{ height: Math.max(160, rows.length * 34 + 24) }}>
        <BarChart data={rows} layout="vertical" margin={{ left: -8, right: 40 }}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v} %`} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="short" width={160} tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={{ fillOpacity: 0.5 }}
            content={
              <ChartTooltipContent
                hideIndicator
                labelKey="name"
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name}
                formatter={(value, _name, item) =>
                  `${Math.round(Number(value))} % točk · v celoti pravilno ${Math.round(item.payload.success)} %`
                }
              />
            }
          />
          <Bar dataKey="average" fill="var(--color-average)" radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList
              dataKey="average"
              position="right"
              className="fill-foreground text-xs font-semibold"
              formatter={(v) => `${Math.round(Number(v))} %`}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export function AttemptsByDayChart({ data }: { data: QuizStats['by_day'] }) {
  const rows = data.map((d) => ({ day: formatDate(d.day), count: d.count }))
  return (
    <ChartCard title="Reševanja po dnevih" description="Število oddanih poskusov na dan.">
      <ChartContainer config={countConfig} className="aspect-auto h-56 w-full">
        <BarChart data={rows} margin={{ top: 16, left: -16, right: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <ChartTooltip cursor={{ fillOpacity: 0.5 }} content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
