import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/server/auth'

export function requireAuth(request: NextRequest) {
  const authUser = getAuthUserFromRequest(request)
  if (!authUser) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true as const, user: authUser }
}

export function requireAdmin(request: NextRequest) {
  const auth = requireAuth(request)
  if (!auth.ok) return auth

  if (auth.user.role !== 'admin') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 }),
    }
  }

  return auth
}
