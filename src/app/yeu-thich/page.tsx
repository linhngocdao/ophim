'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useMovieStore } from '@/store/useMovieStore'
import { MovieGrid } from '@/components/movies/MovieGrid'

export default function FavoritesPage() {
  const { favorites, clearHistory } = useMovieStore()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#f31260] rounded-full" />
            Phim Yêu Thích
          </h1>
          {favorites.length > 0 && (
            <span className="text-muted-foreground text-sm">{favorites.length} phim</span>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">Chưa có phim yêu thích</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Nhấn vào biểu tượng trái tim khi xem phim để thêm vào đây
            </p>
            <Link
              href="/"
              className="bg-[#f31260] hover:bg-[#e01055] text-white px-6 py-2.5 rounded-full transition-colors text-sm font-medium"
            >
              Khám phá phim
            </Link>
          </div>
        ) : (
          <MovieGrid movies={favorites} columns={5} />
        )}
      </div>
    </div>
  )
}
