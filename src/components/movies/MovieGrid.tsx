'use client'

import { MovieCard } from './MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movie'

interface MovieGridProps {
  movies?: Movie[]
  loading?: boolean
  className?: string
  columns?: 2 | 3 | 4 | 5 | 6
}

const columnClasses: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
}

function MovieCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[2/3] w-full rounded-lg bg-white/5" />
      <Skeleton className="h-4 w-full rounded bg-white/5" />
      <Skeleton className="h-3 w-3/4 rounded bg-white/5" />
      <Skeleton className="h-3 w-1/2 rounded bg-white/5" />
    </div>
  )
}

export function MovieGrid({ movies, loading, className, columns = 5 }: MovieGridProps) {
  const gridClass = columnClasses[columns] || columnClasses[5]

  if (loading) {
    return (
      <div className={cn('grid gap-4', gridClass, className)}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-lg font-semibold text-white mb-2">Không tìm thấy phim</h3>
        <p className="text-muted-foreground text-sm">Thử tìm kiếm với từ khóa khác</p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', gridClass, className)}>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          priority={index < 5}
        />
      ))}
    </div>
  )
}
