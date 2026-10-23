import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Menu } from 'lucide-react'

import { useAuth } from '@/auth/auth-context'
import { Logo } from '@/components/layout/Logo'
import { UserMenu } from '@/components/layout/UserMenu'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/api'

type NavItem = { to: string; label: string; roles?: UserRole[] }

const navItems: NavItem[] = [
  { to: '/kvizi', label: 'Kvizi' },
  { to: '/moji-rezultati', label: 'Moji rezultati' },
  { to: '/ucitelj/kvizi', label: 'Moji kvizi', roles: ['teacher'] },
  { to: '/viri', label: 'Viri' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
    isActive && 'bg-secondary text-secondary-foreground',
  )

export function AppShell() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const items = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          {user && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Meni">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetHeader className="p-0">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-2 grid gap-1">
                  {items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={(state) => cn(linkClass(state), 'px-3 py-2.5 text-base')}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <Logo />
          {user && (
            <nav className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
              {items.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
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
        Večkratnik · matematični kvizi za osnovnošolce ·{' '}
        <Link to="/viri" className="font-semibold hover:text-foreground hover:underline">
          Viri
        </Link>
      </footer>
    </div>
  )
}
