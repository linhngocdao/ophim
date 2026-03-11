import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    await ensureUserIndexes()

    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const { movieId } = await params
    if (!movieId) {
      return NextResponse.json({ error: 'Missing movieId' }, { status: 400 })
    }

    const db = await getMongoDb()
    await db.collection('user_favorites').deleteOne({ profileId, movieId })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove favorite movie' }, { status: 500 })
  }
}
