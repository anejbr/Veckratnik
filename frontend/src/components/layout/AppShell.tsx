import { NavLink, Outlet } from 'react-router'

import { useAuth } from '@/auth/auth-context'
import { Logo } from '@/components/layout/Logo'
import { UserMenu } from '@/components/layout/UserMenu'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/api'

type NavItem = { to: string; label: string; roles?: UserRole[] }

const navItems: NavItem[] = [
  { to: '/kvizi', label: 'Kvizi' },
  { to: '/ucitelj/kvizi', label: 'Moji kvizi', roles: ['teacher'] },
]

export function AppShell() {
  const { user } = useAuth()
  const items = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Logo />
          {user && (
            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      isActive && 'bg-secondary text-secondary-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
          <div className="ml-auto">
            <UserMenu />
          </div>
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
