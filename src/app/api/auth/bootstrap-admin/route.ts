import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { hashPassword } from '@/lib/server/auth'
import type { UserDoc } from '@/types/server'

interface BootstrapPayload {
  email?: string
  password?: string
  name?: string
  secret?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as BootstrapPayload
    const email = payload.email?.trim().toLowerCase()
    const password = payload.password?.trim()
    const name = payload.name?.trim() || 'Admin'
    const secret = payload.secret?.trim()

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không hợp lệ' }, { status: 400 })
    }

    const requiredSecret = process.env.ADMIN_BOOTSTRAP_SECRET
    if (requiredSecret && secret !== requiredSecret) {
      return NextResponse.json({ error: 'Invalid bootstrap secret' }, { status: 403 })
    }

    const db = await getMongoDb()
    const exists = await db.collection<UserDoc>('users').findOne({ email }, { projection: { _id: 1 } })
    if (exists) {
      await db.collection<UserDoc>('users').updateOne(
        { _id: exists._id },
        { $set: { role: 'admin', isActive: true, updatedAt: new Date() } }
      )
      return NextResponse.json({ message: 'User upgraded to admin' })
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()
    await db.collection<UserDoc>('users').insertOne({
      _id: userId,
      email,
      name,
      passwordHash,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: 'Admin created', userId })
  } catch (error) {
    console.error('Bootstrap admin error:', error)
    return NextResponse.json({ error: 'Failed to bootstrap admin' }, { status: 500 })
  }
}
