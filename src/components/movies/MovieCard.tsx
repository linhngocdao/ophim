'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Star } from 'lucide-react'
import { getImageUrl } from '@/lib/api'
import { cn, formatEpisode } from '@/lib/utils'
import type { Movie } from '@/types/movie'

// Tiny 10x15 grey blur placeholder (base64 JPEG)
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMF/8QAIBAAAQMEAwEAAAAAAAAAAAAAAQIDBAAFESFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Ame2a3qlXTnk1UtixuEIWOZCVbAcXp96kKUpW8IqY2T9Y4FvtDqv/2Q=='

interface MovieCardProps {
  movie: Movie
  className?: string
  priority?: boolean
}

const typeColors: Record<string, string> = {
  movie: 'bg-blue-600',
  series: 'bg-green-600',
  hoathinh: 'bg-orange-500',
  tvshows: 'bg-purple-600',
}

const typeLabels: Record<string, string> = {
  movie: 'Lẻ',
  series: 'Bộ',
  hoathinh: 'Hoạt Hình',
  tvshows: 'TV',
}

export function MovieCard({ movie, className, priority = false }: MovieCardProps) {
  const imageUrl = getImageUrl(movie.thumb_url || movie.poster_url)
  const episode = formatEpisode(movie.episode_current, movie.episode_total)

  return (
    <Link href={`/phim/${movie.slug}`} className={cn('group block h-full w-full', className)}>
      <div className="relative w-full pt-[150%] overflow-hidden rounded-md bg-[#1a1a1a] border border-white/5 transition-all duration-300 group-hover:z-20 group-hover:scale-[1.08] group-hover:border-white/20 group-hover:shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
        <Image
          src={imageUrl}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          unoptimized
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-[#e50914] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
              Xem ngay
            </span>
          </div>
        </div>

        {/* Top-left: Quality + Lang */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 w-[calc(100%-16px)]">
          {movie.quality && (
            <span className="bg-[#e50914] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none w-max max-w-[90%] truncate">
              {movie.quality}
            </span>
          )}
          {movie.lang && (
            <span className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded leading-none w-max max-w-[90%] truncate">
              {movie.lang}
            </span>
          )}
        </div>

        {/* Top-right: Type */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              'text-white text-[10px] font-medium px-1.5 py-0.5 rounded leading-none shadow-sm',
              typeColors[movie.type] || 'bg-gray-600'
            )}
          >
            {typeLabels[movie.type] || movie.type}
          </span>
        </div>

        {/* Bottom gradient: episode + rating */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-2 py-2 flex items-end justify-between w-full">
          {episode && (
            <span className="text-yellow-400 text-[10px] font-medium truncate max-w-[70%] mr-2 drop-shadow-md">
              {episode}
            </span>
          )}
          {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 bg-black/70 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded ml-auto backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {movie.tmdb.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-[#e50914] transition-colors" title={movie.name}>
          {movie.name}
        </h3>
        <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5" title={movie.origin_name}>{movie.origin_name}</p>
      </div>
    </Link>
  )
}
