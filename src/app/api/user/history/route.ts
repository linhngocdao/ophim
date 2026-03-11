import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { buildMovieSnapshot, ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'
import type { HistoryInput } from '@/types/user'

interface HistoryPayload extends HistoryInput {
  profileId?: string
}

export async function GET(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? 50)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50

    const db = await getMongoDb()
    const history = await db
      .collection('user_history')
      .find({ profileId }, { projection: { _id: 0 } })
      .sort({ watchedAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('History GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch watch history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const payload = (await request.json()) as HistoryPayload
    const profileId = getProfileIdFromRequest(request, payload.profileId)

    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    if (!payload.movie?._id || !payload.movie.slug || !payload.episodeSlug) {
      return NextResponse.json({ error: 'Invalid history payload' }, { status: 400 })
    }

    const watchProgress = Number(payload.watchProgress ?? 0)
    const normalizedProgress = Number.isFinite(watchProgress)
      ? Math.min(Math.max(watchProgress, 0), 100)
      : 0

    const db = await getMongoDb()
    const now = new Date()
    const movieId = payload.movie._id
    const movieSnapshot = buildMovieSnapshot(payload.movie)

    await db.collection('user_history').updateOne(
      { profileId, movieId },
      {
        $set: {
          profileId,
          movieId,
          movie: movieSnapshot,
          episodeName: payload.episodeName ?? '',
          episodeSlug: payload.episodeSlug,
          watchProgress: normalizedProgress,
          watchedAt: now,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('History POST error:', error)
    return NextResponse.json({ error: 'Failed to save watch history' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const movieId = request.nextUrl.searchParams.get('movieId')
    const db = await getMongoDb()

    if (movieId) {
      await db.collection('user_history').deleteOne({ profileId, movieId })
    } else {
      await db.collection('user_history').deleteMany({ profileId })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('History DELETE error:', error)
    return NextResponse.json({ error: 'Failed to clear watch history' }, { status: 500 })
  }
}
