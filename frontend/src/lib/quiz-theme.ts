import type { QuizTheme } from '@/types/quiz'

type ThemeClasses = {
  label: string
  /** gradient za naslovnico */
  cover: string
  /** mehko ozadje (npr. kartica vprašanja) */
  soft: string
  /** poudarjen tekst */
  text: string
  /** gumb / izbran element */
  solid: string
  ring: string
  swatch: string
}

export const QUIZ_THEMES: Record<QuizTheme, ThemeClasses> = {
  indigo: {
    label: 'Indigo',
    cover: 'from-indigo-400 to-violet-500',
    soft: 'bg-indigo-50',
    text: 'text-indigo-700',
    solid: 'bg-indigo-600 text-white hover:bg-indigo-700',
    ring: 'ring-indigo-400',
    swatch: 'bg-indigo-500',
  },
  sky: {
    label: 'Nebo',
    cover: 'from-sky-300 to-blue-500',
    soft: 'bg-sky-50',
    text: 'text-sky-700',
    solid: 'bg-sky-600 text-white hover:bg-sky-700',
    ring: 'ring-sky-400',
    swatch: 'bg-sky-500',
  },
  emerald: {
    label: 'Smaragd',
    cover: 'from-emerald-300 to-teal-500',
    soft: 'bg-emerald-50',
    text: 'text-emerald-700',
    solid: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ring: 'ring-emerald-400',
    swatch: 'bg-emerald-500',
  },
  amber: {
    label: 'Sonce',
    cover: 'from-amber-300 to-orange-400',
    soft: 'bg-amber-50',
    text: 'text-amber-800',
    solid: 'bg-amber-500 text-white hover:bg-amber-600',
    ring: 'ring-amber-400',
    swatch: 'bg-amber-400',
  },
  rose: {
    label: 'Vrtnica',
    cover: 'from-rose-300 to-pink-500',
    soft: 'bg-rose-50',
    text: 'text-rose-700',
    solid: 'bg-rose-600 text-white hover:bg-rose-700',
    ring: 'ring-rose-400',
    swatch: 'bg-rose-500',
  },
  violet: {
    label: 'Vijolica',
    cover: 'from-violet-400 to-fuchsia-500',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    solid: 'bg-violet-600 text-white hover:bg-violet-700',
    ring: 'ring-violet-400',
    swatch: 'bg-violet-500',
  },
  orange: {
    label: 'Oranžna',
    cover: 'from-orange-300 to-red-500',
    soft: 'bg-orange-50',
    text: 'text-orange-700',
    solid: 'bg-orange-500 text-white hover:bg-orange-600',
    ring: 'ring-orange-400',
    swatch: 'bg-orange-500',
  },
  teal: {
    label: 'Morje',
    cover: 'from-teal-300 to-cyan-600',
    soft: 'bg-teal-50',
    text: 'text-teal-700',
    solid: 'bg-teal-600 text-white hover:bg-teal-700',
    ring: 'ring-teal-400',
    swatch: 'bg-teal-500',
  },
}

export function quizTheme(theme: string | undefined): ThemeClasses {
  return QUIZ_THEMES[(theme as QuizTheme) ?? 'indigo'] ?? QUIZ_THEMES.indigo
}
