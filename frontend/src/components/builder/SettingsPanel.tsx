import type { ReactNode } from 'react'
import { BookOpen, Dices, Lock, Plus, Trash } from 'lucide-react'

import { TagInput } from '@/components/builder/TagInput'
import type { QuizDraftApi } from '@/components/builder/useQuizDraft'
import { FormField } from '@/components/form/FormField'
import { NumberField } from '@/components/form/NumberField'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SOURCES } from '@/lib/sources'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPRSTUVZ23456789'

function randomCode(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5">
      <div>
        <h2 className="text-lg font-extrabold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function ToggleRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={id} className="font-semibold">
          {label}
        </Label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function SettingsPanel({ draft }: { draft: QuizDraftApi }) {
  const { state, update, updateSettings } = draft
  const { settings } = state
  const locked = state.access_code !== null
  const timeLimitMinutes = settings.time_limit_seconds ? settings.time_limit_seconds / 60 : null

  const setSource = (index: number, value: string) =>
    update('sources', state.sources.map((s, i) => (i === index ? value : s)))

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Section title="Osnovno">
          <FormField id="description" label="Opis">
            <Textarea
              id="description"
              rows={3}
              maxLength={2000}
              value={state.description}
              placeholder="Kratko povej, kaj učenci vadijo s tem kvizom."
              onChange={(event) => update('description', event.target.value)}
            />
          </FormField>
          <FormField id="grade" label="Razred">
            <Select
              value={state.grade ? String(state.grade) : 'brez'}
              onValueChange={(value) => update('grade', value === 'brez' ? null : Number(value))}
            >
              <SelectTrigger id="grade" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brez">Ni določen</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    {g}. razred
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid gap-1.5">
            <Label className="font-semibold">Tagi</Label>
            <TagInput value={state.tags} onChange={(tags) => update('tags', tags)} />
            <p className="text-xs text-muted-foreground">Po tagih učenci iščejo kvize. Potrdi z Enter.</p>
          </div>
        </Section>

        <Section title="Zaklep s kodo" description="Zaklenjen kviz lahko rešujejo le učenci, ki jim poveš kodo.">
          <ToggleRow
            id="locked"
            label="Zakleni kviz"
            checked={locked}
            onChange={(checked) => update('access_code', checked ? randomCode() : null)}
          />
          {locked && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={state.access_code ?? ''}
                  maxLength={20}
                  onChange={(event) => update('access_code', event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  className="h-10 pl-9 font-mono text-lg font-bold tracking-widest"
                  aria-label="Koda za dostop"
                />
              </div>
              <Button variant="outline" onClick={() => update('access_code', randomCode())}>
                <Dices /> Nova koda
              </Button>
            </div>
          )}
        </Section>
      </div>

      <div className="space-y-4">
        <Section title="Pravila reševanja">
          <ToggleRow
            id="show_timer"
            label="Prikaži štoparico"
            hint="Učenec med reševanjem vidi, koliko časa rešuje. Čas se vedno zabeleži."
            checked={settings.show_timer}
            onChange={(show_timer) => updateSettings({ show_timer })}
          />
          <ToggleRow
            id="time_limit"
            label="Časovna omejitev"
            hint="Ob izteku časa se kviz samodejno odda."
            checked={settings.time_limit_seconds !== null}
            onChange={(checked) => updateSettings({ time_limit_seconds: checked ? 300 : null })}
          />
          {settings.time_limit_seconds !== null && (
            <div className="flex items-center gap-2 pl-1">
              <NumberField
                className="w-24"
                value={timeLimitMinutes}
                onValueChange={(minutes) =>
                  updateSettings({ time_limit_seconds: Math.min(7200, Math.max(10, Math.round((minutes ?? 1) * 60))) })
                }
                aria-label="Časovna omejitev v minutah"
              />
              <span className="text-sm font-semibold text-muted-foreground">minut</span>
            </div>
          )}
          <ToggleRow
            id="shuffle_questions"
            label="Premešaj vrstni red nalog"
            checked={settings.shuffle_questions}
            onChange={(shuffle_questions) => updateSettings({ shuffle_questions })}
          />
          <ToggleRow
            id="shuffle_options"
            label="Premešaj možnosti pri izbirnih nalogah"
            checked={settings.shuffle_options}
            onChange={(shuffle_options) => updateSettings({ shuffle_options })}
          />
          <ToggleRow
            id="show_correct_answers"
            label="Po oddaji pokaži pravilne odgovore"
            checked={settings.show_correct_answers}
            onChange={(show_correct_answers) => updateSettings({ show_correct_answers })}
          />
          <ToggleRow
            id="max_attempts"
            label="Omeji število poskusov"
            checked={settings.max_attempts !== null}
            onChange={(checked) => updateSettings({ max_attempts: checked ? 3 : null })}
          />
          {settings.max_attempts !== null && (
            <div className="flex items-center gap-2 pl-1">
              <NumberField
                integer
                className="w-20"
                value={settings.max_attempts}
                onValueChange={(value) => updateSettings({ max_attempts: Math.min(100, Math.max(1, value ?? 1)) })}
                aria-label="Največ poskusov"
              />
              <span className="text-sm font-semibold text-muted-foreground">poskusov na učenca</span>
            </div>
          )}
        </Section>

        <Section title="Viri" description="Na katerih virih temeljijo naloge (učenci jih vidijo na strani kviza).">
          {state.sources.length > 0 && (
            <ul className="space-y-2">
              {state.sources.map((source, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <Textarea rows={2} value={source} onChange={(event) => setSource(index, event.target.value)} className="text-sm" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => update('sources', state.sources.filter((_, i) => i !== index))}
                    aria-label="Odstrani vir"
                  >
                    <Trash />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <BookOpen /> Dodaj iz seznama
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {SOURCES.filter((s) => s.forTasks).map((source) => (
                  <DropdownMenuItem
                    key={source.id}
                    disabled={state.sources.includes(source.citation)}
                    onSelect={() => update('sources', [...state.sources, source.citation])}
                  >
                    {source.short}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              disabled={state.sources.length >= 20}
              onClick={() => update('sources', [...state.sources, ''])}
            >
              <Plus /> Lasten vir
            </Button>
          </div>
        </Section>
      </div>
    </div>
  )
}
