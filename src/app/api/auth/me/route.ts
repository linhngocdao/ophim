import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { getAuthUserFromRequest } from '@/lib/server/auth'
import type { UserDoc } from '@/types/server'

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const db = await getMongoDb()
    const user = await db.collection<UserDoc>('users').findOne(
      { _id: authUser.userId },
      { projection: { passwordHash: 0, resetPasswordToken: 0, resetPasswordExpire: 0 } }
    )
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name || '',
        role: user.role || 'user',
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Cannot fetch profile' }, { status: 500 })
  }
}
