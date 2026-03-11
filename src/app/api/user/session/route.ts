import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'

export async function POST(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const payload = (await request.json().catch(() => ({}))) as { profileId?: string }
    const incomingProfileId = getProfileIdFromRequest(request, payload.profileId)
    const profileId = isValidProfileId(incomingProfileId) ? incomingProfileId : crypto.randomUUID()

    const db = await getMongoDb()
    const now = new Date()

    await db.collection('user_profiles').updateOne(
      { profileId },
      {
        $set: {
          updatedAt: now,
          lastSeenAt: now,
          userAgent: request.headers.get('user-agent') ?? '',
        },
        $setOnInsert: {
          profileId,
          createdAt: now,
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ profileId })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Failed to initialize user session' }, { status: 500 })
  }
}
