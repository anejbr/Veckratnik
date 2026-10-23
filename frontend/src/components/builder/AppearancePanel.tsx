import type { QuizDraftApi } from '@/components/builder/useQuizDraft'
import { Segmented } from '@/components/form/Segmented'
import { ChoiceInput } from '@/components/questions/inputs/ChoiceInput'
import { QuizCover } from '@/components/quiz/QuizCover'
import { Label } from '@/components/ui/label'
import { QUIZ_THEMES } from '@/lib/quiz-theme'
import { cn } from '@/lib/utils'
import type { QuizTheme } from '@/types/quiz'

const EMOJIS = [
  '🧮', '✖️', '➗', '➕', '🔢', '📐', '🧠', '🎯', '🧩', '🚀', '⭐', '🌈',
  '🐸', '🦊', '🐼', '🦁', '🐙', '🐝', '🦄', '🐢', '🍎', '🍕', '🎈', '🏆',
]

export function AppearancePanel({ draft }: { draft: QuizDraftApi }) {
  const { state, updateSettings } = draft
  const { settings } = state

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-6 rounded-3xl border bg-card p-5">
        <section className="space-y-2">
          <Label className="text-base font-extrabold">Barvna tema</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(QUIZ_THEMES) as QuizTheme[]).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updateSettings({ theme })}
                aria-pressed={settings.theme === theme}
                className={cn(
                  'flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm font-semibold transition',
                  settings.theme === theme ? 'border-transparent ring-2 ring-offset-2 ' + QUIZ_THEMES[theme].ring : 'hover:border-foreground/20',
                )}
              >
                <span className={cn('size-6 rounded-full', QUIZ_THEMES[theme].swatch)} />
                {QUIZ_THEMES[theme].label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <Label className="text-base font-extrabold">Sličica naslovnice</Label>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => updateSettings({ emoji })}
                aria-pressed={settings.emoji === emoji}
                className={cn(
                  'grid aspect-square place-items-center rounded-xl border text-2xl transition hover:scale-110',
                  settings.emoji === emoji ? 'border-primary bg-primary/10' : 'bg-card',
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-base font-extrabold">Velikost pisave</Label>
            <Segmented
              value={settings.font_size}
              onChange={(font_size) => updateSettings({ font_size })}
              options={[
                { value: 'normal', label: 'Običajna' },
                { value: 'large', label: 'Velika (1.–3. razred)' },
              ]}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-extrabold">Prikaz nalog</Label>
            <Segmented
              value={settings.layout}
              onChange={(layout) => updateSettings({ layout })}
              options={[
                { value: 'one_by_one', label: 'Ena po ena' },
                { value: 'all_at_once', label: 'Vse naenkrat' },
              ]}
            />
          </div>
        </section>
      </div>

      <div className="space-y-3 lg:sticky lg:top-20">
        <p className="text-sm font-bold text-muted-foreground">Tako bo kviz videti</p>
        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <QuizCover theme={settings.theme} emoji={settings.emoji} locked={Boolean(state.access_code)} className="h-32 text-6xl" />
          <div className={cn('space-y-4 p-5', settings.font_size === 'large' && 'text-lg')}>
            <h3 className="text-xl font-black">{state.title || 'Naslov kviza'}</h3>
            <p className={cn('font-bold', settings.font_size === 'large' ? 'text-2xl' : 'text-xl')}>Koliko je 3 · 4?</p>
            <ChoiceInput
              options={[
                { id: 'a', text: '12' },
                { id: 'b', text: '7' },
              ]}
              multiple={false}
              value="a"
              onChange={() => undefined}
              theme={settings.theme}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
