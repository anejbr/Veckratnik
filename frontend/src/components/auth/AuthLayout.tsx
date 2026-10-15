import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/api'

type AuthLayoutProps = {
  role: UserRole
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ role, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-svh flex-col items-center justify-center bg-gradient-to-br px-4 py-10',
        role === 'student' ? 'from-sky-50 to-indigo-100' : 'from-amber-50 to-rose-100',
      )}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Izbira vloge
          </Link>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-lg sm:p-8">
          <span
            className={cn(
              'inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase',
              role === 'student' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-800',
            )}
          >
            {role === 'student' ? 'Učenec' : 'Učitelj'}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-6 space-y-1 text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </div>
  )
}
