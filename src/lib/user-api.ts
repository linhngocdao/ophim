import type { Movie } from '@/types/movie'
import type { HistoryInput } from '@/types/user'

const PROFILE_STORAGE_KEY = 'ophim_profile_id_v1'

let profilePromise: Promise<string> | null = null

async function createSession(profileId?: string): Promise<string> {
  const res = await fetch('/api/user/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileId ? { profileId } : {}),
  })

  if (!res.ok) {
    throw new Error('Failed to initialize user session')
  }

  const json = (await res.json()) as { profileId: string }
  return json.profileId
}

export async function ensureProfileId(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('ensureProfileId can only be called in browser')
  }

  if (profilePromise) return profilePromise

  profilePromise = (async () => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY)
    const profileId = await createSession(saved || undefined)
    localStorage.setItem(PROFILE_STORAGE_KEY, profileId)
    return profileId
  })()

  return profilePromise
}

async function userPost(path: string, payload: object): Promise<void> {
  const profileId = await ensureProfileId()
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-profile-id': profileId,
    },
    body: JSON.stringify({ ...payload, profileId }),
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`)
  }
}

async function userDelete(path: string): Promise<void> {
  const profileId = await ensureProfileId()
  const res = await fetch(path, {
    method: 'DELETE',
    headers: {
      'x-profile-id': profileId,
    },
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`)
  }
}

async function userGet<T>(path: string): Promise<T> {
  const profileId = await ensureProfileId()
  const res = await fetch(path, {
    method: 'GET',
    headers: {
      'x-profile-id': profileId,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`)
  }
  return res.json() as Promise<T>
}

export async function syncFavorite(movie: Movie): Promise<void> {
  await userPost('/api/user/favorites', { movie })
}

export async function unsyncFavorite(movieId: string): Promise<void> {
  await userDelete(`/api/user/favorites/${movieId}`)
}

export async function syncWatchHistory(data: HistoryInput): Promise<void> {
  await userPost('/api/user/history', data)
}

export async function clearWatchHistory(movieId?: string): Promise<void> {
  const suffix = movieId ? `?movieId=${encodeURIComponent(movieId)}` : ''
  await userDelete(`/api/user/history${suffix}`)
}

export async function getPersonalizedRecommendations(limit = 18): Promise<Movie[]> {
  const response = await userGet<{ data?: Movie[] }>(
    `/api/user/recommendations?limit=${encodeURIComponent(String(limit))}`
  )
  return response.data ?? []
}

export async function getMyRating(movieId: string): Promise<{ rating?: number; review?: string } | null> {
  const response = await userGet<{ data?: { rating?: number; review?: string } | null }>(
    `/api/user/ratings?movieId=${encodeURIComponent(movieId)}`
  )
  return response.data ?? null
}

export async function saveMyRating(input: {
  movie: Movie
  rating: number
  review?: string
}): Promise<void> {
  await userPost('/api/user/ratings', input)
}

function snapshotToMovie(snapshot: Partial<Movie> & { _id: string; slug: string; name: string }): Movie {
  return {
    _id: snapshot._id,
    slug: snapshot.slug,
    name: snapshot.name,
    origin_name: snapshot.origin_name || snapshot.name,
    type: (snapshot.type as Movie['type']) || 'movie',
    thumb_url: snapshot.thumb_url || '',
    poster_url: snapshot.poster_url || snapshot.thumb_url || '',
    year: snapshot.year || new Date().getFullYear(),
    category: snapshot.category || [],
    country: snapshot.country || [],
    episode_current: snapshot.episode_current,
    quality: snapshot.quality,
    lang: snapshot.lang,
  }
}

interface FavoriteResponseItem {
  movie?: Partial<Movie> & { _id: string; slug: string; name: string }
}

interface HistoryResponseItem {
  movie?: Partial<Movie> & { _id: string; slug: string; name: string }
  episodeName?: string
  episodeSlug?: string
  watchProgress?: number
  watchedAt?: string
}

export interface MovieComment {
  commentId: string
  profileId: string
  movieId: string
  content: string
  parentId: string | null
  likeCount: number
  replyCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
  }
  likedByMe: boolean
}

export async function getRemoteFavorites(): Promise<Movie[]> {
  const response = await userGet<{ data?: FavoriteResponseItem[] }>('/api/user/favorites?limit=200')
  return (response.data ?? [])
    .map((item) => item.movie)
    .filter(
      (movie): movie is Partial<Movie> & { _id: string; slug: string; name: string } =>
        Boolean(movie?._id && movie.slug && movie.name)
    )
    .map((movie) => snapshotToMovie(movie))
}

export async function getRemoteHistory(): Promise<Array<{
  movie: Movie
  episodeName: string
  episodeSlug: string
  watchProgress?: number
  watchedAt: string
}>> {
  const response = await userGet<{ data?: HistoryResponseItem[] }>('/api/user/history?limit=200')
  const validItems = (response.data ?? []).filter(
    (item): item is HistoryResponseItem & { movie: Partial<Movie> & { _id: string; slug: string; name: string }; episodeSlug: string } =>
      Boolean(item.movie?._id && item.movie.slug && item.movie.name && item.episodeSlug)
  )

  return validItems
    .map((item) => ({
      movie: snapshotToMovie(item.movie),
      episodeName: item.episodeName || '',
      episodeSlug: item.episodeSlug || '',
      watchProgress: item.watchProgress,
      watchedAt: item.watchedAt || new Date().toISOString(),
    }))
}

export async function getMovieComments(
  movieId: string,
  page = 1,
  limit = 8,
  parentId?: string
): Promise<{
  data: MovieComment[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}> {
  const params = new URLSearchParams({
    movieId,
    page: String(page),
    limit: String(limit),
  })
  if (parentId) params.set('parentId', parentId)
  return userGet(`/api/user/comments?${params.toString()}`)
}

export async function createMovieComment(input: {
  movie: Movie
  content: string
}): Promise<MovieComment> {
  const profileId = await ensureProfileId()
  const res = await fetch('/api/user/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-profile-id': profileId,
    },
    body: JSON.stringify({
      profileId,
      movie: input.movie,
      content: input.content,
    }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json?.error || 'Không thể gửi bình luận')
  }
  const json = (await res.json()) as { data: MovieComment }
  return json.data
}

export async function replyMovieComment(input: {
  movie: Movie
  commentId: string
  content: string
}): Promise<MovieComment> {
  const profileId = await ensureProfileId()
  const res = await fetch(`/api/user/comments/${input.commentId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-profile-id': profileId,
    },
    body: JSON.stringify({
      profileId,
      movie: input.movie,
      content: input.content,
    }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json?.error || 'Không thể phản hồi bình luận')
  }
  const json = (await res.json()) as { data: MovieComment }
  return json.data
}

export async function toggleCommentLike(commentId: string): Promise<{ liked: boolean }> {
  const profileId = await ensureProfileId()
  const res = await fetch(`/api/user/comments/${commentId}/react`, {
    method: 'POST',
    headers: {
      'x-profile-id': profileId,
    },
  })
  if (!res.ok) {
    throw new Error('Không thể thích bình luận')
  }
  return res.json() as Promise<{ liked: boolean }>
}
