import { createContext, useContext } from 'react'

import type { TokenResponse, User } from '@/types/api'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: (response: TokenResponse) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth mora biti znotraj <AuthProvider>')
  return context
}
