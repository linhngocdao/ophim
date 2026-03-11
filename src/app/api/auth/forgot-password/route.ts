import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import type { UserDoc } from '@/types/server'

interface ForgotPayload {
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ForgotPayload
    const email = payload.email?.trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const db = await getMongoDb()
    const user = await db.collection<UserDoc>('users').findOne({ email }, { projection: { _id: 1 } })
    if (!user) {
      return NextResponse.json({ message: 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.' })
    }

    const rawToken = crypto.randomBytes(24).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expire = new Date(Date.now() + 1000 * 60 * 30)

    await db.collection<UserDoc>('users').updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: tokenHash, resetPasswordExpire: expire, updatedAt: new Date() } }
    )

    return NextResponse.json({
      message: 'Tạo token reset thành công.',
      resetToken: rawToken,
      note: 'Trong production bạn cần gửi resetToken qua email thay vì trả thẳng API.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Không thể xử lý yêu cầu' }, { status: 500 })
  }
}
