import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { hashPassword, signAuthToken, getAuthCookieName } from '@/lib/server/auth'
import type { UserDoc } from '@/types/server'

interface RegisterPayload {
  email?: string
  password?: string
  name?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RegisterPayload
    const email = payload.email?.trim().toLowerCase()
    const password = payload.password?.trim()
    const name = payload.name?.trim() || ''

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không hợp lệ' }, { status: 400 })
    }

    const db = await getMongoDb()
    const existing = await db.collection<UserDoc>('users').findOne({ email }, { projection: { _id: 1 } })
    if (existing) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()
    await db.collection<UserDoc>('users').insertOne({
      _id: userId,
      email,
      name,
      passwordHash,
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const token = signAuthToken({ userId, email, role: 'user' })
    const response = NextResponse.json({
      user: { id: userId, email, name, role: 'user' },
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
    console.error('Auth register error:', error)
    return NextResponse.json({ error: 'Đăng ký thất bại' }, { status: 500 })
  }
}
