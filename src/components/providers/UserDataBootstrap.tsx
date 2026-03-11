'use client'

import { useEffect } from 'react'
import { useMovieStore } from '@/store/useMovieStore'
import {
  ensureProfileId,
  getRemoteFavorites,
  getRemoteHistory,
  syncFavorite,
  syncWatchHistory,
} from '@/lib/user-api'
import type { Movie } from '@/types/movie'

function mergeFavorites(local: Movie[], remote: Movie[]): Movie[] {
  const merged = new Map<string, Movie>()
  for (const movie of [...remote, ...local]) {
    if (!movie?._id) continue
    merged.set(movie._id, movie)
  }
  return Array.from(merged.values())
}

type HistoryItem = {
  movie: Movie
  episodeName: string
  episodeSlug: string
  watchProgress?: number
  watchedAt: string
}

function mergeHistory(local: HistoryItem[], remote: HistoryItem[]): HistoryItem[] {
  const merged = new Map<string, HistoryItem>()
  for (const item of [...remote, ...local]) {
    if (!item.movie?._id || !item.episodeSlug) continue
    const key = `${item.movie._id}:${item.episodeSlug}`
    const prev = merged.get(key)
    if (!prev || new Date(item.watchedAt).getTime() > new Date(prev.watchedAt).getTime()) {
      merged.set(key, item)
    }
  }
  return Array.from(merged.values())
    .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
    .slice(0, 50)
}

export function UserDataBootstrap() {
  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        await ensureProfileId()

        const store = useMovieStore.getState()
        const localFavorites = store.favorites
        const localHistory = store.watchHistory

        const [remoteFavorites, remoteHistory] = await Promise.all([
          getRemoteFavorites().catch(() => []),
          getRemoteHistory().catch(() => []),
        ])

        if (!active) return

        const mergedFavorites = mergeFavorites(localFavorites, remoteFavorites)
        const mergedHistory = mergeHistory(localHistory, remoteHistory)

        useMovieStore.setState({
          favorites: mergedFavorites,
          watchHistory: mergedHistory,
        })

        const remoteFavoriteIds = new Set(remoteFavorites.map((m) => m._id))
        const remoteHistoryKeys = new Set(remoteHistory.map((h) => `${h.movie._id}:${h.episodeSlug}`))

        for (const movie of localFavorites) {
          if (!remoteFavoriteIds.has(movie._id)) {
            void syncFavorite(movie).catch(() => undefined)
          }
        }

        for (const item of localHistory) {
          const key = `${item.movie._id}:${item.episodeSlug}`
          if (!remoteHistoryKeys.has(key)) {
            void syncWatchHistory(item).catch(() => undefined)
          }
        }
      } catch {
        // Fail silently to keep app responsive even when backend is unavailable.
      }
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  return null
}
