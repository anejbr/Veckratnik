import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { AuthContext, type AuthContextValue } from '@/auth/auth-context'
import { api, AUTH_EXPIRED_EVENT, tokenStorage } from '@/lib/api'
import type { TokenResponse, User } from '@/types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null)

  useEffect(() => {
    if (!tokenStorage.get()) return
    const controller = new AbortController()
    api<User>('/auth/me', { signal: controller.signal })
      .then(setUser)
      .catch(() => {
        if (!controller.signal.aborted) tokenStorage.clear()
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const signIn = useCallback(
    (response: TokenResponse) => {
      tokenStorage.set(response.access_token)
      queryClient.clear()
      setUser(response.user)
    },
    [queryClient],
  )

  const signOut = useCallback(() => {
    tokenStorage.clear()
    queryClient.clear()
    setUser(null)
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
