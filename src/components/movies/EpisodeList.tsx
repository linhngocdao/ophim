'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Episode } from '@/types/movie'

interface EpisodeListProps {
  episodes: Episode[]
  movieSlug: string
  currentEpisodeSlug?: string
  lockedFromIndex?: number
  isAuthenticated?: boolean
}

export function EpisodeList({
  episodes,
  movieSlug,
  currentEpisodeSlug,
  lockedFromIndex,
  isAuthenticated = false,
}: EpisodeListProps) {
  const [activeServer, setActiveServer] = useState(0)

  // Lọc bỏ các tập không có link_embed
  const validEpisodes = episodes
    .map((server) => ({
      ...server,
      server_data: server.server_data.filter((ep) => !!ep.link_embed),
    }))
    .filter((server) => server.server_data.length > 0)

  if (!validEpisodes || validEpisodes.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Chưa có tập phim nào
      </div>
    )
  }

  const currentServer = validEpisodes[Math.min(activeServer, validEpisodes.length - 1)]

  return (
    <div className="space-y-4">
      {/* Server tabs */}
      {validEpisodes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {validEpisodes.map((server, index) => (
            <button
              key={index}
              onClick={() => setActiveServer(index)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
                activeServer === index
                  ? 'bg-[#f31260] border-[#f31260] text-white'
                  : 'border-white/20 text-gray-300 hover:border-[#f31260] hover:text-white'
              )}
            >
              {server.server_name}
            </button>
          ))}
        </div>
      )}

      {/* Episodes grid */}
      {currentServer && (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {currentServer.server_data.map((ep, index) => {
            const isActive = currentEpisodeSlug === ep.slug
            const isLocked = !isAuthenticated && typeof lockedFromIndex === 'number' && index >= lockedFromIndex

            return (
              <Link
                key={ep.slug}
                href={
                  isLocked
                    ? `/dang-nhap?next=${encodeURIComponent(`/phim/${movieSlug}/xem/${ep.slug}`)}`
                    : `/phim/${movieSlug}/xem/${ep.slug}`
                }
                className={cn(
                  'flex items-center justify-center gap-1 px-2 py-1.5 rounded text-sm font-medium transition-colors border text-center',
                  isActive
                    ? 'bg-[#f31260] border-[#f31260] text-white shadow-sm shadow-[#f31260]/30'
                    : isLocked
                      ? 'border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400/50'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-[#f31260]/20 hover:border-[#f31260]/50 hover:text-white'
                )}
              >
                {isLocked && <Lock className="h-3 w-3" />}
                {ep.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
