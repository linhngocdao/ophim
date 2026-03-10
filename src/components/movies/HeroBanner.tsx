'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/api'
import { cn, formatEpisode } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { Movie } from '@/types/movie'

interface HeroBannerProps {
  movies?: Movie[]
  loading?: boolean
}

export function HeroBanner({ movies, loading }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const featuredMovies = movies?.slice(0, 5) || []
  const current = featuredMovies[currentIndex]

  useEffect(() => {
    if (featuredMovies.length <= 1) return
    const timer = setInterval(() => {
      goNext()
    }, 6000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, featuredMovies.length])

  const goNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goPrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  if (loading) {
    return (
      <div className="relative w-full aspect-[16/7] min-h-[300px] bg-gray-900">
        <Skeleton className="w-full h-full bg-white/5" />
        <div className="absolute bottom-8 left-8 space-y-3">
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-4 w-96 bg-white/10" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  const posterUrl = getImageUrl(current.poster_url || current.thumb_url)
  const episode = formatEpisode(current.episode_current, current.episode_total)

  return (
    <div className="relative w-full aspect-[16/7] min-h-[320px] max-h-[600px] overflow-hidden bg-gray-900">
      {/* Background image */}
      {featuredMovies.map((movie, index) => (
        <div
          key={movie._id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Image
            src={getImageUrl(movie.poster_url || movie.thumb_url)}
            alt={movie.name}
            fill
            className="object-cover object-top"
            priority={index === 0}
            unoptimized
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
        <div className="max-w-2xl space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {current.quality && (
              <span className="bg-[#f31260] text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                {current.quality}
              </span>
            )}
            {current.lang && (
              <span className="bg-black/60 border border-white/20 text-white text-xs px-2 py-0.5 rounded">
                {current.lang}
              </span>
            )}
            {episode && (
              <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs px-2 py-0.5 rounded">
                {episode}
              </span>
            )}
            {current.year && (
              <span className="text-gray-400 text-xs">{current.year}</span>
            )}
            {current.tmdb?.vote_average && current.tmdb.vote_average > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 text-xs">
                <Star className="w-3 h-3 fill-yellow-400" />
                {current.tmdb.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight line-clamp-2">
              {current.name}
            </h1>
            {current.origin_name && current.origin_name !== current.name && (
              <p className="text-gray-400 text-sm mt-1">{current.origin_name}</p>
            )}
          </div>

          {/* Description */}
          {current.content && (
            <p
              className="text-gray-300 text-sm line-clamp-2 max-w-lg"
              dangerouslySetInnerHTML={{ __html: current.content.replace(/<[^>]*>/g, '') }}
            />
          )}

          {/* Categories */}
          {current.category && current.category.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {current.category.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/the-loai/${cat.slug}`}
                  className="text-xs text-gray-300 hover:text-[#f31260] border border-white/20 hover:border-[#f31260] px-2 py-0.5 rounded transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/phim/${current.slug}`}
              className="flex items-center gap-2 bg-[#f31260] hover:bg-[#e01055] text-white font-semibold px-6 py-2.5 rounded-full transition-colors shadow-lg shadow-[#f31260]/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Xem ngay
            </Link>
            <Link
              href={`/phim/${current.slug}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-2.5 rounded-full transition-colors backdrop-blur-sm"
            >
              <Info className="w-4 h-4" />
              Chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[#f31260] hover:border-[#f31260] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[#f31260] hover:border-[#f31260] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-4 right-8 flex gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-[#f31260] w-6 h-2'
                  : 'bg-white/40 hover:bg-white/70 w-2 h-2'
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {featuredMovies.length > 1 && (
        <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-2">
          {featuredMovies.map((movie, index) => (
            <button
              key={movie._id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative w-16 h-10 rounded overflow-hidden border-2 transition-all',
                index === currentIndex ? 'border-[#f31260] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              )}
            >
              <Image
                src={getImageUrl(movie.thumb_url)}
                alt={movie.name}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
