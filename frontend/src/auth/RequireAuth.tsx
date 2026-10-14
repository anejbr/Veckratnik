import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/auth/auth-context'
import type { UserRole } from '@/types/api'

export function RequireAuth({ role }: { role?: UserRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-muted-foreground">Nalagam …</div>
    )
  }
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to="/kvizi" replace />
  return <Outlet />
}
