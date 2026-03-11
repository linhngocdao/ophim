'use client'

import { useQuery } from '@tanstack/react-query'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

export function useAuthUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return null
      const json = (await res.json()) as { user?: AuthUser | null }
      return json.user ?? null
    },
    staleTime: 60 * 1000,
    retry: 0,
  })
}
