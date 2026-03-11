import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { verifyPassword, signAuthToken, getAuthCookieName } from '@/lib/server/auth'
import type { UserDoc } from '@/types/server'

interface LoginPayload {
  email?: string
  password?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as LoginPayload
    const email = payload.email?.trim().toLowerCase()
    const password = payload.password?.trim()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không hợp lệ' }, { status: 400 })
    }

    const db = await getMongoDb()
    const user = await db.collection<UserDoc>('users').findOne({ email })
    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 })
    }

    await db.collection<UserDoc>('users').updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date(), updatedAt: new Date() } })

    const token = signAuthToken({ userId: String(user._id), email, role: user.role || 'user' })
    const response = NextResponse.json({
      user: { id: String(user._id), email, name: user.name || '', role: user.role || 'user' },
    })
    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('Auth login error:', error)
    return NextResponse.json({ error: 'Đăng nhập thất bại' }, { status: 500 })
  }
}
