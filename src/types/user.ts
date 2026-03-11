import type { Movie } from '@/types/movie'

export interface MovieSnapshot {
  _id: string
  slug: string
  name: string
  origin_name?: string
  thumb_url?: string
  poster_url?: string
  type?: string
  year?: number
  episode_current?: string
  quality?: string
  lang?: string
  categorySlugs?: string[]
  countrySlugs?: string[]
}

export interface UserProfile {
  profileId: string
  createdAt: Date
  updatedAt: Date
  lastSeenAt: Date
  userAgent?: string
}

export interface UserFavorite {
  profileId: string
  movieId: string
  movie: MovieSnapshot
  createdAt: Date
  updatedAt: Date
}

export interface UserHistory {
  profileId: string
  movieId: string
  movie: MovieSnapshot
  episodeName: string
  episodeSlug: string
  watchProgress: number
  watchedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserRating {
  profileId: string
  movieId: string
  movie: MovieSnapshot
  rating: number
  review?: string
  createdAt: Date
  updatedAt: Date
}

export interface HistoryInput {
  movie: Movie
  episodeName: string
  episodeSlug: string
  watchProgress?: number
}
