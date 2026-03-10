'use client'

import { use, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { useMovieDetail } from '@/hooks/useMovies'
import { VideoPlayer } from '@/components/movies/VideoPlayer'
import { EpisodeList } from '@/components/movies/EpisodeList'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovieStore } from '@/store/useMovieStore'

interface WatchPageProps {
  params: Promise<{ slug: string; tap: string }>
}

export default function WatchPage({ params }: WatchPageProps) {
  const { slug, tap } = use(params)
  const { data, isLoading, error } = useMovieDetail(slug)
  const { addToHistory } = useMovieStore()

  const movie = data?.data?.item
  const episodes = movie?.episodes ?? []

  // Chỉ lấy các tập có link_embed hợp lệ
  const validEpisodes = episodes.map((server) => ({
    ...server,
    server_data: server.server_data.filter((ep) => !!ep.link_embed),
  })).filter((server) => server.server_data.length > 0)

  // Tìm tập hiện tại theo slug (chỉ trong các tập hợp lệ)
  const findEpisode = () => {
    for (const server of validEpisodes) {
      const ep = server.server_data.find((e) => e.slug === tap)
      if (ep) return { episode: ep, server }
    }
    return null
  }

  const found = findEpisode()
  const currentEpisode = found?.episode
  const currentServer = found?.server

  // Prev/next từ server đầu tiên hợp lệ
  const allEps = validEpisodes[0]?.server_data ?? []
  const currentEpIndex = allEps.findIndex((e) => e.slug === tap)
  const prevEp = currentEpIndex > 0 ? allEps[currentEpIndex - 1] : null
  const nextEp = currentEpIndex < allEps.length - 1 ? allEps[currentEpIndex + 1] : null

  useEffect(() => {
    if (movie && currentEpisode) {
      addToHistory({
        movie,
        episodeName: currentEpisode.name,
        episodeSlug: currentEpisode.slug,
        watchedAt: new Date().toISOString(),
      })
    }
  }, [movie, currentEpisode, addToHistory])

  // Don't show "not found" while still loading
  if (isLoading || (!data && !error)) {
    return (
      <div className="min-h-screen bg-black">
        <Skeleton className="w-full aspect-video" />
        <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-8 gap-2 mt-6">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded" />
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
          <div className="text-5xl">😕</div>
          <h1 className="text-xl font-bold">Không tìm thấy phim</h1>
          <Link
            href="/"
            className="inline-block bg-[#f31260] text-white px-6 py-2 rounded-full hover:bg-[#e01055] transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  if (!currentEpisode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎬</div>
          <h1 className="text-xl font-bold">Không tìm thấy tập phim</h1>
          <Link
            href={`/phim/${slug}`}
            className="inline-block bg-[#f31260] text-white px-6 py-2 rounded-full hover:bg-[#e01055] transition-colors"
          >
            Quay lại
          </Link>
        </div>
      </div>
    )
  }

  const embedUrl = currentEpisode.link_embed

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player */}
      <div className="bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <VideoPlayer
            embedUrl={embedUrl}
            title={`${movie.name} - Tập ${currentEpisode.name}`}
            className="w-full"
          />
        </div>
      </div>

      {/* Content below player */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title and navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href={`/phim/${slug}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang phim
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold">{movie.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {currentServer?.server_name} — Tập {currentEpisode.name}
            </p>
          </div>

          {/* Prev/Next episode */}
          <div className="flex items-center gap-2">
            {prevEp ? (
              <Link
                href={`/phim/${slug}/xem/${prevEp.slug}`}
                className="flex items-center gap-1.5 bg-secondary hover:bg-muted border border-border text-foreground px-4 py-2 rounded-full text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Tập trước
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 bg-secondary border border-border text-muted-foreground px-4 py-2 rounded-full text-sm cursor-not-allowed opacity-50">
                <ChevronLeft className="w-4 h-4" />
                Tập trước
              </span>
            )}
            {nextEp ? (
              <Link
                href={`/phim/${slug}/xem/${nextEp.slug}`}
                className="flex items-center gap-1.5 bg-[#f31260] hover:bg-[#e01055] text-white px-4 py-2 rounded-full text-sm transition-colors"
              >
                Tập tiếp theo
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 bg-secondary border border-border text-muted-foreground px-4 py-2 rounded-full text-sm cursor-not-allowed opacity-50">
                Tập tiếp theo
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>

        {/* Episode List */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <List className="w-4 h-4 text-[#f31260]" />
            Danh sách tập
          </h2>
          <EpisodeList episodes={episodes} movieSlug={slug} currentEpisodeSlug={tap} />
        </div>

        {/* Movie info */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#f31260] rounded-full" />
            Thông tin phim
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground flex-shrink-0">Tên phim:</span>
              <span className="text-foreground">{movie.name}</span>
            </div>
            {movie.origin_name && (
              <div className="flex gap-2">
                <span className="text-muted-foreground flex-shrink-0">Tên gốc:</span>
                <span className="text-foreground">{movie.origin_name}</span>
              </div>
            )}
            {movie.year && (
              <div className="flex gap-2">
                <span className="text-muted-foreground flex-shrink-0">Năm:</span>
                <span className="text-foreground">{movie.year}</span>
              </div>
            )}
            {movie.quality && (
              <div className="flex gap-2">
                <span className="text-muted-foreground flex-shrink-0">Chất lượng:</span>
                <span className="text-yellow-500">{movie.quality}</span>
              </div>
            )}
            {movie.lang && (
              <div className="flex gap-2">
                <span className="text-muted-foreground flex-shrink-0">Ngôn ngữ:</span>
                <span className="text-foreground">{movie.lang}</span>
              </div>
            )}
            {movie.episode_current && (
              <div className="flex gap-2">
                <span className="text-muted-foreground flex-shrink-0">Tập hiện tại:</span>
                <span className="text-green-500">{movie.episode_current}</span>
              </div>
            )}
          </div>

          {movie.category && movie.category.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground text-sm">Thể loại:</span>
              {movie.category.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/the-loai/${cat.slug}`}
                  className="text-xs px-2.5 py-1 bg-secondary hover:bg-[#f31260]/20 border border-border hover:border-[#f31260]/40 text-foreground hover:text-white rounded-full transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
