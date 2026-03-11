import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'
import type { Movie } from '@/types/movie'

type Counters = Record<string, number>

function addCount(counters: Counters, key: string | undefined, score = 1): void {
  if (!key) return
  counters[key] = (counters[key] ?? 0) + score
}

function pickTopKeys(counters: Counters, limit: number): string[] {
  return Object.entries(counters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key)
}

function scoreMovie(
  movie: Movie,
  favoriteTypes: Set<string>,
  categoryPrefs: Set<string>,
  countryPrefs: Set<string>
): number {
  let score = 0
  if (favoriteTypes.has(movie.type)) score += 2
  if (movie.category?.some((item) => categoryPrefs.has(item.slug))) score += 2
  if (movie.country?.some((item) => countryPrefs.has(item.slug))) score += 1
  if (movie.tmdb?.vote_average) score += Math.min(movie.tmdb.vote_average / 5, 2)
  return score
}

export async function GET(request: NextRequest) {
  try {
    await ensureUserIndexes()

    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? 18)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 6), 50) : 18

    const db = await getMongoDb()
    const [favorites, history, ratings] = await Promise.all([
      db.collection('user_favorites').find({ profileId }).limit(100).toArray(),
      db.collection('user_history').find({ profileId }).sort({ watchedAt: -1 }).limit(200).toArray(),
      db.collection('user_ratings').find({ profileId, rating: { $gte: 7 } }).limit(100).toArray(),
    ])

    const categoryCounts: Counters = {}
    const countryCounts: Counters = {}
    const typeCounts: Counters = {}
    const seenMovieIds = new Set<string>()

    for (const item of favorites) {
      seenMovieIds.add(item.movieId)
      addCount(typeCounts, item.movie?.type, 2)
      ;(item.movie?.categorySlugs ?? []).forEach((slug: string) => addCount(categoryCounts, slug, 2))
      ;(item.movie?.countrySlugs ?? []).forEach((slug: string) => addCount(countryCounts, slug, 1))
    }

    for (const item of history) {
      seenMovieIds.add(item.movieId)
      addCount(typeCounts, item.movie?.type, 1)
      ;(item.movie?.categorySlugs ?? []).forEach((slug: string) => addCount(categoryCounts, slug, 1))
      ;(item.movie?.countrySlugs ?? []).forEach((slug: string) => addCount(countryCounts, slug, 1))
    }

    for (const item of ratings) {
      addCount(typeCounts, item.movie?.type, 2)
      ;(item.movie?.categorySlugs ?? []).forEach((slug: string) => addCount(categoryCounts, slug, 2))
      ;(item.movie?.countrySlugs ?? []).forEach((slug: string) => addCount(countryCounts, slug, 1))
    }

    const preferredTypes = pickTopKeys(typeCounts, 3)
    const fallbackTypes = ['movie', 'series']
    const selectedTypes = [...new Set([...preferredTypes, ...fallbackTypes])]
      .filter((item): item is Movie['type'] =>
        item === 'movie' || item === 'series' || item === 'hoathinh' || item === 'tvshows'
      )

    const categoryPrefs = new Set(pickTopKeys(categoryCounts, 6))
    const countryPrefs = new Set(pickTopKeys(countryCounts, 4))
    const favoriteTypes = new Set(preferredTypes)

    const dbMovies = await db.collection<Movie>('movies')
      .find(
        {
          _id: { $nin: Array.from(seenMovieIds) },
          ...(selectedTypes.length ? { type: { $in: selectedTypes } } : {}),
        },
        { projection: { searchableText: 0 } as never }
      )
      .sort({ updatedAt: -1, 'modified.time': -1 })
      .limit(Math.max(limit * 8, 80))
      .toArray()

    const listResults = [dbMovies]
    const candidatesMap = new Map<string, Movie>()

    for (const items of listResults) {
      for (const movie of items) {
        if (!movie?._id || seenMovieIds.has(movie._id)) continue
        if (!candidatesMap.has(movie._id)) {
          candidatesMap.set(movie._id, movie)
        }
      }
    }

    const sorted = Array.from(candidatesMap.values())
      .map((movie) => ({
        movie,
        score: scoreMovie(movie, favoriteTypes, categoryPrefs, countryPrefs),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.movie)

    return NextResponse.json({
      data: sorted,
      meta: {
        profileId,
        hasPersonalization: favorites.length + history.length + ratings.length > 0,
      },
    })
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
