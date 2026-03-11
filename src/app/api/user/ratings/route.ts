import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { buildMovieSnapshot, ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'
import type { Movie } from '@/types/movie'

interface RatingPayload {
  profileId?: string
  movie?: Movie
  rating?: number
  review?: string
}

export async function GET(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const movieId = request.nextUrl.searchParams.get('movieId')
    const db = await getMongoDb()

    if (movieId) {
      const rating = await db
        .collection('user_ratings')
        .findOne({ profileId, movieId }, { projection: { _id: 0 } })
      return NextResponse.json({ data: rating })
    }

    const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? 50)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50
    const ratings = await db
      .collection('user_ratings')
      .find({ profileId }, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ data: ratings })
  } catch (error) {
    console.error('Ratings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const payload = (await request.json()) as RatingPayload
    const profileId = getProfileIdFromRequest(request, payload.profileId)

    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    if (!payload.movie?._id || !payload.movie.slug || !payload.movie.name) {
      return NextResponse.json({ error: 'Invalid movie payload' }, { status: 400 })
    }

    const rawRating = Number(payload.rating)
    if (!Number.isFinite(rawRating) || rawRating < 1 || rawRating > 10) {
      return NextResponse.json({ error: 'Rating must be between 1 and 10' }, { status: 400 })
    }

    const db = await getMongoDb()
    const now = new Date()
    const movieId = payload.movie._id
    const movieSnapshot = buildMovieSnapshot(payload.movie)
    const review = payload.review?.trim()
    const watched = await db.collection('user_history').findOne({ profileId, movieId }, { projection: { _id: 1 } })

    if (!watched) {
      return NextResponse.json(
        { error: 'Bạn cần xem phim trước khi đánh giá.' },
        { status: 403 }
      )
    }

    await db.collection('user_ratings').updateOne(
      { profileId, movieId },
      {
        $set: {
          profileId,
          movieId,
          movie: movieSnapshot,
          rating: Math.round(rawRating * 10) / 10,
          review: review?.slice(0, 1000) ?? '',
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
    console.error('Ratings POST error:', error)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}
