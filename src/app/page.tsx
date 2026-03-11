'use client'

import { motion } from 'framer-motion'
import { useNewMovies, useMoviesByType } from '@/hooks/useMovies'
import { HeroBanner } from '@/components/movies/HeroBanner'
import { MovieCarousel } from '@/components/movies/MovieCarousel'
import { usePersonalizedRecommendations } from '@/hooks/usePersonalization'
import { useMovieStore } from '@/store/useMovieStore'
import { MobileHomeExperience } from '@/components/home/MobileHomeExperience'

export default function HomePage() {
  const { data: newMovies, isLoading: loadingNew } = useNewMovies(1)
  const { data: phimLe, isLoading: loadingLe } = useMoviesByType('phim-le', 1)
  const { data: phimBo, isLoading: loadingBo } = useMoviesByType('phim-bo', 1)
  const { data: hoatHinh, isLoading: loadingHoatHinh } = useMoviesByType('hoat-hinh', 1)
  const { data: tvShows, isLoading: loadingTv } = useMoviesByType('tv-shows', 1)
  const { data: recommendedMovies, isLoading: loadingRecommended } = usePersonalizedRecommendations(36)
  const { watchHistory } = useMovieStore()
  const continueWatching = watchHistory
    .map((item) => item.movie)
    .filter((movie, index, arr) => arr.findIndex((m) => m._id === movie._id) === index)
    .slice(0, 14)
  const secondaryRecommended = recommendedMovies?.slice(12) ?? []

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <MobileHomeExperience
        newMovies={newMovies?.data?.items}
        recommendedMovies={recommendedMovies}
        seriesMovies={phimBo?.data?.items}
        singleMovies={phimLe?.data?.items}
      />

      <div className="hidden md:block">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <HeroBanner
            movies={newMovies?.data?.items}
            loading={loadingNew}
          />
        </motion.div>

        <div className="max-w-screen-2xl mx-auto -mt-10 pb-10 space-y-10 relative z-10">

          {continueWatching.length > 0 && (
            <MovieCarousel
              title="Tiếp Tục Xem"
              movies={continueWatching}
              viewAllHref="/lich-su"
            />
          )}

          <MovieCarousel
            title="Dành Riêng Cho Bạn"
            movies={recommendedMovies}
            loading={loadingRecommended}
          />

          <MovieCarousel
            title="Đề Xuất Mở Rộng"
            movies={secondaryRecommended}
            loading={loadingRecommended}
            viewAllHref="/de-xuat"
          />

          <MovieCarousel
            title="Phim Mới Cập Nhật"
            movies={newMovies?.data?.items}
            loading={loadingNew}
            viewAllHref="/danh-sach/phim-moi-cap-nhat"
          />

          <MovieCarousel
            title="Phim Lẻ"
            movies={phimLe?.data?.items}
            loading={loadingLe}
            viewAllHref="/danh-sach/phim-le"
          />

          <MovieCarousel
            title="Phim Bộ"
            movies={phimBo?.data?.items}
            loading={loadingBo}
            viewAllHref="/danh-sach/phim-bo"
          />

          <MovieCarousel
            title="Hoạt Hình"
            movies={hoatHinh?.data?.items}
            loading={loadingHoatHinh}
            viewAllHref="/danh-sach/hoat-hinh"
          />

          <MovieCarousel
            title="TV Shows"
            movies={tvShows?.data?.items}
            loading={loadingTv}
            viewAllHref="/danh-sach/tv-shows"
          />
        </div>
      </div>
    </div>
  )
}
