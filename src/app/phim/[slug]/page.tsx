'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Heart, Star, Clock, Calendar, Globe, Users, Clapperboard, Tag, Youtube } from 'lucide-react'
import { useMovieDetail, useMoviesByType } from '@/hooks/useMovies'
import { getImageUrl } from '@/lib/api'
import { EpisodeList } from '@/components/movies/EpisodeList'
import { MovieCarousel } from '@/components/movies/MovieCarousel'
import { MovieRatingCard } from '@/components/movies/MovieRatingCard'
import { MovieDiscussion } from '@/components/movies/MovieDiscussion'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovieStore } from '@/store/useMovieStore'
import { cn, formatEpisode } from '@/lib/utils'

interface MovieDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = use(params)
  const { data, isLoading, error } = useMovieDetail(slug)
  const { addFavorite, removeFavorite, isFavorite } = useMovieStore()
  const [imagePage, setImagePage] = useState(1)

  // movie is inside data.data.item
  const movie = data?.data?.item
  const episodes = movie?.episodes ?? []

  const { data: relatedMovies } = useMoviesByType(
    movie?.type === 'movie' ? 'phim-le' : 'phim-bo',
    1
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-[60vh] bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-[2/3] rounded-lg" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎬</div>
          <h1 className="text-2xl font-bold">Không tìm thấy phim</h1>
          <p className="text-muted-foreground">Phim này không tồn tại hoặc đã bị xóa</p>
          <Link
            href="/"
            className="inline-block bg-[#f31260] hover:bg-[#e01055] text-white px-6 py-2.5 rounded-full transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url)
  const backdropUrl = getImageUrl(movie.thumb_url || movie.poster_url)
  const episodeLabel = formatEpisode(movie.episode_current, movie.episode_total)
  const isMovieFavorite = isFavorite(movie._id)

  // Tìm tập đầu tiên có link_embed hợp lệ (không rỗng)
  const firstEpisode = episodes
    ?.flatMap((s) => s.server_data)
    .find((ep) => !!ep.link_embed)

  const handleFavoriteToggle = () => {
    if (isMovieFavorite) {
      removeFavorite(movie._id)
    } else {
      addFavorite(movie)
    }
  }

  const typeLabel: Record<string, string> = {
    movie: 'Phim Lẻ',
    series: 'Phim Bộ',
    hoathinh: 'Hoạt Hình',
    tvshows: 'TV Shows',
  }

  const keywords = new Set<string>()
  keywords.add(typeLabel[movie.type] || movie.type)
  if (movie.year) keywords.add(String(movie.year))
  if (movie.lang) keywords.add(movie.lang)
  if (movie.quality) keywords.add(movie.quality)
  movie.category?.forEach((item) => keywords.add(item.name))
  movie.country?.forEach((item) => keywords.add(item.name))
  movie.alternative_names?.forEach((name) => {
    name
      .split(/[;,]/)
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 3)
      .forEach((token) => keywords.add(token))
  })
  if (movie.origin_name) keywords.add(movie.origin_name)
  const keywordList = Array.from(keywords).slice(0, 24)

  const seoImages = data?.data?.seoOnPage?.og_image ?? []
  const imageUrls = Array.from(
    new Set(
      [movie.poster_url, movie.thumb_url, ...seoImages]
        .filter((url): url is string => Boolean(url))
        .map((url) => (url.startsWith('http') ? url : getImageUrl(url)))
    )
  )

  const imagesPerPage = 6
  const imageTotalPages = Math.max(1, Math.ceil(imageUrls.length / imagesPerPage))
  const currentImages = imageUrls.slice((imagePage - 1) * imagesPerPage, imagePage * imagesPerPage)

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={backdropUrl}
          alt={movie.name}
          fill
          className="object-cover object-top blur-sm scale-105"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Main content */}
      <motion.div
        className="max-w-screen-xl mx-auto px-4 sm:px-6 -mt-40 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
          {/* Poster */}
          <div className="flex justify-center md:block">
            <div className="relative w-48 md:w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src={posterUrl}
                alt={movie.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            {/* Type & Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#f31260] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                {typeLabel[movie.type] || movie.type}
              </span>
              {movie.quality && (
                <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium px-2.5 py-1 rounded-full uppercase">
                  {movie.quality}
                </span>
              )}
              {movie.lang && (
                <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  {movie.lang}
                </span>
              )}
              {episodeLabel && (
                <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  {episodeLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {movie.name}
              </h1>
              {movie.origin_name && (
                <p className="text-gray-400 mt-1 text-lg">{movie.origin_name}</p>
              )}
            </div>

            {/* Ratings */}
            <div className="flex flex-wrap items-center gap-4">
              {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{movie.tmdb.vote_average.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">TMDB</span>
                </div>
              )}
              {movie.imdb?.vote_average && movie.imdb.vote_average > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="text-orange-400 font-semibold">{movie.imdb.vote_average.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">IMDb</span>
                </div>
              )}
            </div>

            {/* Movie info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {movie.year && (
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Năm:</span>
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.time && (
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Thời lượng:</span>
                  <span>{movie.time}</span>
                </div>
              )}
              {movie.country && movie.country.length > 0 && (
                <div className="flex items-center gap-2 text-foreground flex-wrap">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Quốc gia:</span>
                  <div className="flex flex-wrap gap-1">
                    {movie.country.map((c) => (
                      <Link key={c.id} href={`/quoc-gia/${c.slug}`} className="text-[#f31260] hover:underline">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {movie.director && movie.director.length > 0 && (
                <div className="flex items-center gap-2 text-foreground flex-wrap">
                  <Clapperboard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Đạo diễn:</span>
                  <span>{movie.director.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {movie.category && movie.category.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {movie.category.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/the-loai/${cat.slug}`}
                    className="text-xs px-3 py-1 bg-secondary hover:bg-[#f31260]/20 border border-border hover:border-[#f31260]/40 text-foreground hover:text-white rounded-full transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Actors */}
            {movie.actor && movie.actor.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Diễn viên: </span>
                  {movie.actor.slice(0, 8).join(', ')}
                  {movie.actor.length > 8 && '...'}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {firstEpisode ? (
                <Link
                  href={`/phim/${movie.slug}/xem/${firstEpisode.slug}`}
                  className="flex items-center gap-2 bg-[#f31260] hover:bg-[#e01055] text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg shadow-[#f31260]/20"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Xem phim
                </Link>
              ) : movie.trailer_url ? (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#f31260] hover:bg-[#e01055] text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg shadow-[#f31260]/20"
                >
                  <Youtube className="w-5 h-5" />
                  Xem Trailer
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 bg-muted text-muted-foreground font-semibold px-8 py-3 rounded-full cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  Chưa có video
                </button>
              )}

              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  'flex items-center gap-2 font-medium px-6 py-3 rounded-full border transition-colors',
                  isMovieFavorite
                    ? 'bg-[#f31260]/20 border-[#f31260] text-[#f31260]'
                    : 'bg-secondary border-border text-foreground hover:bg-muted hover:border-muted-foreground'
                )}
              >
                <Heart className={cn('w-4 h-4', isMovieFavorite && 'fill-[#f31260]')} />
                {isMovieFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </button>

              {/* Nút Trailer phụ — chỉ hiện khi đã có tập phim VÀ có trailer */}
              {firstEpisode && movie.trailer_url && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-secondary hover:bg-muted border border-border text-foreground font-medium px-6 py-3 rounded-full transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {movie.content && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#f31260] rounded-full" />
                  Nội dung phim
                </h2>
                <div
                  className="text-muted-foreground text-sm leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: movie.content }}
                />
              </div>
            )}

            {/* Keywords */}
            {keywordList.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#f31260] rounded-full" />
                  Từ khóa ({keywordList.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {keywordList.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 text-xs rounded-full bg-secondary border border-border text-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {imageUrls.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#f31260] rounded-full" />
                  Hình ảnh phim ({imageUrls.length} ảnh)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentImages.map((url) => (
                    <div key={url} className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/10">
                      <Image
                        src={url}
                        alt={movie.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>

                {imageTotalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={imagePage}
                      totalPages={imageTotalPages}
                      onPageChange={setImagePage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <MovieRatingCard movie={movie} />
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Thông tin nhanh</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Số tập server: {episodes.reduce((acc, item) => acc + item.server_data.length, 0)}</li>
                <li>Cập nhật: {movie.modified?.time ? new Date(movie.modified.time).toLocaleString('vi-VN') : 'N/A'}</li>
                <li>IMDb: {movie.imdb?.vote_average ? `${movie.imdb.vote_average.toFixed(1)}/10` : 'N/A'}</li>
                <li>TMDB: {movie.tmdb?.vote_average ? `${movie.tmdb.vote_average.toFixed(1)}/10` : 'N/A'}</li>
              </ul>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <MovieDiscussion movie={movie} />
        </motion.div>

        {/* Episodes */}
        {episodes && episodes.length > 0 && (
          <div className="mt-8 bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#f31260] rounded-full" />
              Danh sách tập
            </h2>
            <EpisodeList episodes={episodes} movieSlug={movie.slug} />
          </div>
        )}

        {/* Related Movies */}
        <div className="mt-12">
          <MovieCarousel
            title="Phim Liên Quan"
            movies={relatedMovies?.data?.items?.filter((m) => m._id !== movie._id).slice(0, 12)}
            viewAllHref={`/danh-sach/${movie.type === 'movie' ? 'phim-le' : 'phim-bo'}`}
          />
        </div>
      </motion.div>
    </div>
  )
}
