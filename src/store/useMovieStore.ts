import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/types/movie'
import { clearWatchHistory, syncFavorite, syncWatchHistory, unsyncFavorite } from '@/lib/user-api'

interface WatchHistory {
  movie: Movie
  episodeName: string
  episodeSlug: string
  watchProgress?: number
  watchedAt: string
}

interface MovieStore {
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Favorites
  favorites: Movie[]
  addFavorite: (movie: Movie) => void
  removeFavorite: (movieId: string) => void
  isFavorite: (movieId: string) => boolean

  // Watch History
  watchHistory: WatchHistory[]
  setWatchHistory: (items: WatchHistory[]) => void
  addToHistory: (data: WatchHistory) => void
  clearHistory: () => void

  // Current filter
  currentCategory: string | null
  currentCountry: string | null
  setCurrentCategory: (cat: string | null) => void
  setCurrentCountry: (country: string | null) => void
}

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      favorites: [],
      addFavorite: (movie) => {
        set((state) => ({
          favorites: [...state.favorites.filter((f) => f._id !== movie._id), movie],
        }))
        if (typeof window !== 'undefined') {
          void syncFavorite(movie).catch(() => undefined)
        }
      },
      removeFavorite: (movieId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f._id !== movieId),
        }))
        if (typeof window !== 'undefined') {
          void unsyncFavorite(movieId).catch(() => undefined)
        }
      },
      isFavorite: (movieId) => get().favorites.some((f) => f._id === movieId),

      watchHistory: [],
      setWatchHistory: (items) => set({ watchHistory: items.slice(0, 50) }),
      addToHistory: (data) => {
        set((state) => ({
          watchHistory: [
            data,
            ...state.watchHistory.filter((h) => h.movie._id !== data.movie._id),
          ].slice(0, 50),
        }))
        if (typeof window !== 'undefined') {
          void syncWatchHistory(data).catch(() => undefined)
        }
      },
      clearHistory: () => {
        set({ watchHistory: [] })
        if (typeof window !== 'undefined') {
          void clearWatchHistory().catch(() => undefined)
        }
      },

      currentCategory: null,
      currentCountry: null,
      setCurrentCategory: (cat) => set({ currentCategory: cat }),
      setCurrentCountry: (country) => set({ currentCountry: country }),
    }),
    {
      name: 'ophim-store',
      partialize: (state) => ({
        favorites: state.favorites,
        watchHistory: state.watchHistory,
      }),
    }
  )
)
