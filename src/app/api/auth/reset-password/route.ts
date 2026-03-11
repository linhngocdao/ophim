import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { hashPassword } from '@/lib/server/auth'
import type { UserDoc } from '@/types/server'

interface ResetPayload {
  token?: string
  password?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ResetPayload
    const token = payload.token?.trim()
    const password = payload.password?.trim()

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Token hoặc mật khẩu mới không hợp lệ' }, { status: 400 })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const db = await getMongoDb()
    const user = await db.collection<UserDoc>('users').findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: 'Token reset không hợp lệ hoặc đã hết hạn' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    await db.collection<UserDoc>('users').updateOne(
      { _id: user._id },
      {
        $set: { passwordHash, updatedAt: new Date() },
        $unset: { resetPasswordToken: '', resetPasswordExpire: '' },
      }
    )

    return NextResponse.json({ message: 'Đặt lại mật khẩu thành công' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Không thể đặt lại mật khẩu' }, { status: 500 })
  }
}
