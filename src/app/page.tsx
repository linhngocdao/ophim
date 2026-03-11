'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useNewMovies, useMoviesByType } from '@/hooks/useMovies'
import { HeroBanner } from '@/components/movies/HeroBanner'
import { MovieCarousel } from '@/components/movies/MovieCarousel'
import { usePersonalizedRecommendations } from '@/hooks/usePersonalization'
import { useMovieStore } from '@/store/useMovieStore'
import { MobileHomeExperience } from '@/components/home/MobileHomeExperience'
import { MovieCard } from '@/components/movies/MovieCard'
import { getImageUrl } from '@/lib/api'
import { Sparkles } from 'lucide-react'

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
  const featuredDesktop = newMovies?.data?.items?.[0]
  const primaryRecommended = recommendedMovies?.slice(0, 12) ?? []
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

        <div className="max-w-screen-2xl mx-auto py-8 space-y-10">
          {featuredDesktop && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="px-4 md:px-8 lg:px-12"
            >
              <div className="grid grid-cols-[1.4fr_1fr] gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-[#151525] via-[#101018] to-[#0b0b0f] p-5">
                <Link href={`/phim/${featuredDesktop.slug}`} className="group relative overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={getImageUrl(featuredDesktop.poster_url || featuredDesktop.thumb_url)}
                    alt={featuredDesktop.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#ff89b6]">Lựa chọn nổi bật</p>
                    <h3 className="line-clamp-1 text-xl font-bold text-white">{featuredDesktop.name}</h3>
                  </div>
                </Link>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#f31260]/40 bg-[#f31260]/15 px-3 py-1 text-xs text-[#ff8ab5]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Đề xuất cá nhân hóa mở rộng
                  </div>
                  <h3 className="text-2xl font-bold text-white">Dành riêng cho bạn hôm nay</h3>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    Thuật toán sẽ ưu tiên theo lịch sử xem, phim yêu thích và điểm bạn đã đánh giá.
                  </p>
                  <Link
                    href="/de-xuat"
                    className="inline-flex rounded-full bg-[#f31260] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#dd0f56] transition-colors"
                  >
                    Xem kho đề xuất
                  </Link>
                </div>
              </div>
            </motion.section>
          )}

          {primaryRecommended.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="px-4 md:px-8 lg:px-12"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Siêu Đề Xuất Cho Bạn</h2>
                <Link href="/de-xuat" className="text-sm text-[#f31260] hover:text-[#e01055]">
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                {primaryRecommended.map((movie, index) => (
                  <motion.div
                    key={movie._id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <MovieCard movie={movie} priority={index < 6} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

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
