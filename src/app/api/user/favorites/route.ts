import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { buildMovieSnapshot, ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'
import type { Movie } from '@/types/movie'

interface FavoritePayload {
  profileId?: string
  movie?: Movie
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
    const favorites = await db
      .collection('user_favorites')
      .find({ profileId }, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ data: favorites })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const payload = (await request.json()) as FavoritePayload
    const profileId = getProfileIdFromRequest(request, payload.profileId)

    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const movie = payload.movie
    if (!movie?._id || !movie.slug || !movie.name) {
      return NextResponse.json({ error: 'Invalid movie payload' }, { status: 400 })
    }

    const db = await getMongoDb()
    const now = new Date()
    const movieId = movie._id
    const movieSnapshot = buildMovieSnapshot(movie)

    await db.collection('user_favorites').updateOne(
      { profileId, movieId },
      {
        $set: {
          profileId,
          movieId,
          movie: movieSnapshot,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      data: {
        profileId,
        movieId,
        movie: movieSnapshot,
        updatedAt: now,
      },
    })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Failed to save favorite movie' }, { status: 500 })
  }
}

