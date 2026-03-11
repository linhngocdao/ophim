import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

export type UserRole = 'admin' | 'user'

export interface AuthTokenPayload {
  userId: string
  email: string
  role: UserRole
}

const AUTH_COOKIE_NAME = 'ophim_auth'
const JWT_SECRET = process.env.JWT_SECRET || 'ophim_dev_secret_change_me'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const fromCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (fromCookie) return fromCookie

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }
  return null
}

export function getAuthUserFromRequest(request: NextRequest): AuthTokenPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyAuthToken(token)
}
