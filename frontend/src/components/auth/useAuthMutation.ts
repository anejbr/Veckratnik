import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'

import { useAuth } from '@/auth/auth-context'
import { api } from '@/lib/api'
import type { TokenResponse } from '@/types/api'

/** Pošlje prijavo/registracijo, shrani žeton in preusmeri na seznam kvizov. */
export function useAuthMutation<TBody>(path: string) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  return useMutation({
    mutationFn: (body: TBody) => api<TokenResponse>(path, { method: 'POST', body }),
    onSuccess: (response) => {
      signIn(response)
      navigate(from ?? '/kvizi', { replace: true })
    },
  })
}
