import { NavLink, Outlet } from 'react-router'

import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

type NavItem = { to: string; label: string }

const navItems: NavItem[] = [{ to: '/kvizi', label: 'Kvizi' }]

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Logo />
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-secondary text-secondary-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Večkratnik · matematični kvizi za osnovnošolce
      </footer>
    </div>
  )
}
