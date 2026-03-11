import { NextResponse } from 'next/server'
import { getAuthCookieName } from '@/lib/server/auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(getAuthCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
  return response
}
