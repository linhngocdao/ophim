import type { NextRequest } from 'next/server'
import type { Movie } from '@/types/movie'
import type { MovieSnapshot } from '@/types/user'
import { getMongoDb } from '@/lib/server/mongodb'

const PROFILE_ID_REGEX = /^[a-zA-Z0-9_-]{8,128}$/

let indexPromise: Promise<void> | null = null

export function getProfileIdFromRequest(
  request: NextRequest,
  bodyProfileId?: string | null
): string | null {
  const fromBody = bodyProfileId?.trim()
  if (fromBody) return fromBody

  const fromHeader = request.headers.get('x-profile-id')?.trim()
  if (fromHeader) return fromHeader

  const fromQuery = request.nextUrl.searchParams.get('profileId')?.trim()
  if (fromQuery) return fromQuery

  return null
}

export function isValidProfileId(profileId: string | null): profileId is string {
  return Boolean(profileId && PROFILE_ID_REGEX.test(profileId))
}

export function buildMovieSnapshot(movie: Movie): MovieSnapshot {
  return {
    _id: movie._id,
    slug: movie.slug,
    name: movie.name,
    origin_name: movie.origin_name,
    thumb_url: movie.thumb_url,
    poster_url: movie.poster_url,
    type: movie.type,
    year: movie.year,
    episode_current: movie.episode_current,
    quality: movie.quality,
    lang: movie.lang,
    categorySlugs: movie.category?.map((item) => item.slug) ?? [],
    countrySlugs: movie.country?.map((item) => item.slug) ?? [],
  }
}

export async function ensureUserIndexes(): Promise<void> {
  if (indexPromise) return indexPromise

  indexPromise = (async () => {
    const db = await getMongoDb()

    await Promise.all([
      db.collection('user_profiles').createIndex({ profileId: 1 }, { unique: true }),
      db.collection('user_profiles').createIndex({ lastSeenAt: -1 }),
      db.collection('user_favorites').createIndex({ profileId: 1, movieId: 1 }, { unique: true }),
      db.collection('user_favorites').createIndex({ profileId: 1, updatedAt: -1 }),
      db.collection('user_history').createIndex({ profileId: 1, movieId: 1 }, { unique: true }),
      db.collection('user_history').createIndex({ profileId: 1, watchedAt: -1 }),
      db.collection('user_ratings').createIndex({ profileId: 1, movieId: 1 }, { unique: true }),
      db.collection('user_ratings').createIndex({ profileId: 1, updatedAt: -1 }),
      db.collection('user_comments').createIndex({ movieId: 1, parentId: 1, createdAt: -1 }),
      db.collection('user_comments').createIndex({ profileId: 1, movieId: 1, createdAt: -1 }),
      db.collection('user_comment_reactions').createIndex({ commentId: 1, profileId: 1 }, { unique: true }),
    ])
  })()

  return indexPromise
}
