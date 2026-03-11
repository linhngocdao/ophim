import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'
import type { UserDoc } from '@/types/server'

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const db = await getMongoDb()
    const users = await db.collection<UserDoc>('users')
      .find({}, { projection: { passwordHash: 0, resetPasswordToken: 0, resetPasswordExpire: 0 } })
      .sort({ createdAt: -1 })
      .toArray()
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const payload = (await request.json()) as {
      userId?: string
      role?: 'admin' | 'user'
      isActive?: boolean
    }
    if (!payload.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (payload.role) updateData.role = payload.role
    if (typeof payload.isActive === 'boolean') updateData.isActive = payload.isActive

    const db = await getMongoDb()
    const updated = await db.collection<UserDoc>('users').findOneAndUpdate(
      { _id: payload.userId },
      { $set: updateData },
      { returnDocument: 'after', projection: { passwordHash: 0, resetPasswordToken: 0, resetPasswordExpire: 0 } }
    )

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin users PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
