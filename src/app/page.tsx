'use client'

import { useNewMovies, useMoviesByType } from '@/hooks/useMovies'
import { HeroBanner } from '@/components/movies/HeroBanner'
import { MovieCarousel } from '@/components/movies/MovieCarousel'

export default function HomePage() {
  const { data: newMovies, isLoading: loadingNew } = useNewMovies(1)
  const { data: phimLe, isLoading: loadingLe } = useMoviesByType('phim-le', 1)
  const { data: phimBo, isLoading: loadingBo } = useMoviesByType('phim-bo', 1)
  const { data: hoatHinh, isLoading: loadingHoatHinh } = useMoviesByType('hoat-hinh', 1)
  const { data: tvShows, isLoading: loadingTv } = useMoviesByType('tv-shows', 1)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Banner */}
      <HeroBanner
        movies={newMovies?.data?.items}
        loading={loadingNew}
      />

      {/* Movie Carousels */}
      <div className="max-w-screen-2xl mx-auto py-8 space-y-10">
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
  )
}
