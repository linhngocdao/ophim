'use client'

import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import type { Movie } from '@/types/movie'
import { cn } from '@/lib/utils'
import { useMyMovieRating, useSaveMovieRating } from '@/hooks/usePersonalization'

interface MovieRatingCardProps {
  movie: Movie
}

export function MovieRatingCard({ movie }: MovieRatingCardProps) {
  const { data: myRating } = useMyMovieRating(movie._id)
  const saveRating = useSaveMovieRating(movie._id)
  const [hovered, setHovered] = useState<number | null>(null)

  const currentRating = myRating?.rating ?? 0
  const activeValue = hovered ?? currentRating

  const ratingText = useMemo(() => {
    if (!currentRating) return 'Chưa đánh giá'
    if (currentRating >= 9) return 'Tuyệt vời'
    if (currentRating >= 8) return 'Rất hay'
    if (currentRating >= 7) return 'Khá ổn'
    if (currentRating >= 5) return 'Trung bình'
    return 'Chưa phù hợp'
  }, [currentRating])

  const submitRating = (value: number) => {
    if (saveRating.isPending) return
    void saveRating.mutate({
      movie,
      rating: value,
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Đánh giá của bạn</h3>
        <span className="text-sm text-muted-foreground">{ratingText}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => {
          const value = i + 1
          const active = value <= activeValue
          return (
            <button
              key={value}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => submitRating(value)}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center border transition-colors',
                active
                  ? 'bg-[#f31260]/20 border-[#f31260] text-[#f31260]'
                  : 'bg-secondary border-border text-muted-foreground hover:text-[#f31260]'
              )}
              aria-label={`Đánh giá ${value}/10`}
            >
              <Star className={cn('w-3.5 h-3.5', active && 'fill-[#f31260]')} />
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Điểm của bạn giúp hệ thống gợi ý phim sát gu hơn.
      </p>
    </div>
  )
}
