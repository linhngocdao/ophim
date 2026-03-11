'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bell, Clock3, Heart, Play, Search, Sparkles, Star, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/api'
import { formatEpisode } from '@/lib/utils'
import { useMovieStore } from '@/store/useMovieStore'
import type { Movie } from '@/types/movie'

interface MobileHomeExperienceProps {
  newMovies?: Movie[]
  recommendedMovies?: Movie[]
  seriesMovies?: Movie[]
  singleMovies?: Movie[]
}

function PosterCard({ movie, href }: { movie: Movie; href: string }) {
  return (
    <Link href={href} className="group block w-[132px] shrink-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900">
        <Image
          src={getImageUrl(movie.thumb_url || movie.poster_url)}
          alt={movie.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="132px"
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
          {movie.quality && (
            <span className="rounded bg-[#f31260] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              {movie.quality}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium text-white">{movie.name}</p>
      <p className="line-clamp-1 text-xs text-zinc-500">{movie.origin_name}</p>
    </Link>
  )
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-[#ff4d8d]">
          Xem tất cả
        </Link>
      )}
    </div>
  )
}

export function MobileHomeExperience({
  newMovies,
  recommendedMovies,
  seriesMovies,
  singleMovies,
}: MobileHomeExperienceProps) {
  const { watchHistory } = useMovieStore()
  const featured = newMovies?.slice(0, 5) ?? []
  const continueWatching = watchHistory.slice(0, 10)
  const topRecommendations = recommendedMovies?.slice(0, 8) ?? []
  const trendMix = [...(seriesMovies?.slice(0, 4) ?? []), ...(singleMovies?.slice(0, 4) ?? [])]

  return (
    <motion.div
      className="md:hidden min-h-screen bg-[#070709] pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#070709]/90 px-4 pb-3 pt-4 backdrop-blur-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Streaming</p>
            <h1 className="text-xl font-black text-white">
              Nghiền <span className="text-[#ff4d8d]">Phim</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tim-kiem" className="rounded-full border border-white/15 bg-white/5 p-2.5 text-zinc-200">
              <Search className="h-4 w-4" />
            </Link>
            <Link href="/yeu-thich" className="rounded-full border border-white/15 bg-white/5 p-2.5 text-zinc-200">
              <Heart className="h-4 w-4" />
            </Link>
            <button className="rounded-full border border-white/15 bg-white/5 p-2.5 text-zinc-200">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/de-xuat" className="shrink-0 rounded-full bg-[#ff4d8d] px-3 py-1.5 text-xs font-semibold text-white">
            Đề xuất cho bạn
          </Link>
          <Link href="/lich-su" className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200">
            Tiếp tục xem
          </Link>
          <Link href="/danh-sach/phim-moi-cap-nhat" className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200">
            Mới cập nhật
          </Link>
          <Link href="/danh-sach/phim-bo" className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200">
            Phim bộ
          </Link>
        </div>
      </div>

      {featured.length > 0 && (
        <motion.section
          className="px-4 pt-4"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((movie) => (
              <article
                key={movie._id}
                className="relative aspect-[16/10] w-[86vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"
              >
                <Image
                  src={getImageUrl(movie.poster_url || movie.thumb_url)}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  sizes="86vw"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    {movie.tmdb?.vote_average ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-yellow-300">
                        <Star className="h-3 w-3 fill-yellow-300" />
                        {movie.tmdb.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                    {movie.episode_current ? (
                      <span className="rounded-full bg-[#1fd37d]/20 px-2 py-1 text-[11px] text-[#7cf2b6]">
                        {formatEpisode(movie.episode_current, movie.episode_total)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="line-clamp-1 text-lg font-bold text-white">{movie.name}</h3>
                  <p className="line-clamp-1 text-sm text-zinc-300">{movie.origin_name}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/phim/${movie.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4d8d] px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      Xem ngay
                    </Link>
                    <Link
                      href={`/phim/${movie.slug}`}
                      className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-medium text-zinc-100"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.section>
      )}

      {continueWatching.length > 0 && (
        <motion.section
          className="pt-6"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <SectionHeader title="Tiếp Tục Xem" href="/lich-su" />
          <div className="space-y-3 px-4">
            {continueWatching.slice(0, 3).map((item) => (
              <Link
                key={`${item.movie._id}-${item.episodeSlug}`}
                href={`/phim/${item.movie.slug}/xem/${item.episodeSlug}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101015] p-3"
              >
                <div className="relative h-[74px] w-[132px] shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={getImageUrl(item.movie.thumb_url || item.movie.poster_url)}
                    alt={item.movie.name}
                    fill
                    className="object-cover"
                    sizes="132px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{item.movie.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">Tập {item.episodeName}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#ff4d8d]"
                      style={{ width: `${Math.min(Math.max(item.watchProgress ?? 0, 6), 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock3 className="h-3 w-3" />
                    Xem gần đây
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {topRecommendations.length > 0 && (
        <motion.section
          className="pt-6"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <SectionHeader title="Dành Cho Bạn" href="/de-xuat" />
          <div className="grid grid-cols-2 gap-3 px-4">
            {topRecommendations.slice(0, 6).map((movie) => (
              <Link
                key={movie._id}
                href={`/phim/${movie.slug}`}
                className="rounded-2xl border border-white/10 bg-[#101015] p-2"
              >
                <div className="relative mb-2 aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={getImageUrl(movie.thumb_url || movie.poster_url)}
                    alt={movie.name}
                    fill
                    className="object-cover"
                    sizes="48vw"
                    unoptimized
                  />
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-white">{movie.name}</p>
                <p className="line-clamp-1 text-xs text-zinc-400">{movie.origin_name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#ff7db0]">
                  <Sparkles className="h-3 w-3" />
                  Hợp gu của bạn
                </p>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        className="pt-6"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <SectionHeader title="Đang Thịnh Hành" href="/danh-sach/phim-moi-cap-nhat" />
        <div className="flex gap-3 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trendMix.slice(0, 8).map((movie) => (
            <PosterCard key={movie._id} movie={movie} href={`/phim/${movie.slug}`} />
          ))}
        </div>
      </motion.section>

      <motion.section
        className="pt-6"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <SectionHeader title="Mới Cập Nhật" href="/danh-sach/phim-moi-cap-nhat" />
        <div className="flex gap-3 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(newMovies ?? []).slice(0, 10).map((movie) => (
            <PosterCard key={movie._id} movie={movie} href={`/phim/${movie.slug}`} />
          ))}
        </div>
      </motion.section>

      <section className="px-4 pt-7">
        <div className="rounded-3xl border border-[#ff4d8d]/30 bg-gradient-to-r from-[#ff4d8d]/20 via-[#a83fff]/15 to-[#2563ff]/15 p-4">
          <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-[#ff9dc3]">
            <TrendingUp className="h-3.5 w-3.5" />
            Trải nghiệm chuyên nghiệp
          </p>
          <h3 className="text-sm font-bold text-white">Gợi ý cá nhân sẽ chuẩn hơn sau vài lần xem</h3>
          <p className="mt-1 text-xs text-zinc-300">
            Hãy thêm phim yêu thích và chấm điểm để thuật toán đề xuất ngày càng sát gu.
          </p>
        </div>
      </section>
    </motion.div>
  )
}
