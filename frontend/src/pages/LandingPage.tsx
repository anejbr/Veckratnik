import { Link, Navigate } from 'react-router'
import { ArrowRight, Backpack, GraduationCap } from 'lucide-react'

import { useAuth } from '@/auth/auth-context'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

const roles = [
  {
    to: '/prijava/ucenec',
    title: 'Sem učenec',
    text: 'Rešuj kvize, vadi poštevanko in poglej, kako hitro ti gre.',
    icon: Backpack,
    className: 'from-sky-400 to-indigo-500',
  },
  {
    to: '/prijava/ucitelj',
    title: 'Sem učitelj',
    text: 'Sestavi svoje kvize, jih zakleni s kodo in spremljaj statistiko.',
    icon: GraduationCap,
    className: 'from-amber-400 to-rose-500',
  },
]

export function LandingPage() {
  const { user, loading } = useAuth()
  if (!loading && user) return <Navigate to="/kvizi" replace />

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none text-7xl font-black text-primary/5">
        <span className="absolute top-[8%] left-[6%]">2×3</span>
        <span className="absolute top-[18%] right-[10%]">7·8</span>
        <span className="absolute bottom-[14%] left-[12%]">36:6</span>
        <span className="absolute right-[8%] bottom-[8%]">5×9</span>
      </div>

      <div className="relative flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        <Logo className="scale-125" />
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Matematika je igra!</h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Matematični kvizi za osnovnošolce – poštevanka, večkratniki, računi in besedilne naloge.
        </p>

        <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <Link
              key={role.to}
              to={role.to}
              className="group rounded-3xl border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span
                className={cn(
                  'grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow',
                  role.className,
                )}
              >
                <role.icon className="size-7" />
              </span>
              <h2 className="mt-4 flex items-center gap-2 text-2xl font-extrabold">
                {role.title}
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </h2>
              <p className="mt-1 text-muted-foreground">{role.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
