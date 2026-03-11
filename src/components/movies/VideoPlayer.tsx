'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  embedUrl: string
  title?: string
  className?: string
}

export function VideoPlayer({ embedUrl, title, className }: VideoPlayerProps) {
  const [key, setKey] = useState(0)

  const handleReload = () => {
    setKey((prev) => prev + 1)
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Player container */}
      <div
        className={cn(
          'relative bg-black rounded-lg overflow-hidden',
          'aspect-video w-full'
        )}
      >
        <iframe
          key={key}
          src={embedUrl}
          title={title || 'Video Player'}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
        />

        {/* Controls overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleReload}
            className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-[#f31260] transition-colors"
            title="Tải lại"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
