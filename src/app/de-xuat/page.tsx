'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { usePersonalizedRecommendations } from '@/hooks/usePersonalization'
import { MovieGrid } from '@/components/movies/MovieGrid'

export default function RecommendationsPage() {
  const { data: movies, isLoading } = usePersonalizedRecommendations(30)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#f31260] rounded-full" />
            Đề Xuất Cho Bạn
          </h1>
          <Sparkles className="w-5 h-5 text-[#f31260]" />
        </div>

        {!isLoading && (!movies || movies.length === 0) ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <h2 className="text-lg font-semibold">Chưa có đủ dữ liệu để đề xuất</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hãy thêm yêu thích, xem vài tập hoặc chấm điểm phim để nhận gợi ý sát gu hơn.
            </p>
            <Link
              href="/"
              className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-[#f31260] hover:bg-[#e01055] text-white transition-colors"
            >
              Bắt đầu khám phá
            </Link>
          </div>
        ) : (
          <MovieGrid movies={movies} loading={isLoading} columns={6} />
        )}
      </div>
    </div>
  )
}
