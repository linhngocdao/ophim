'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movie'

interface MovieCarouselProps {
  title: string
  movies?: Movie[]
  loading?: boolean
  viewAllHref?: string
  className?: string
}

function MovieCardSkeleton() {
  return (
    <div className="w-[140px] sm:w-[160px] md:w-[180px] space-y-2 shrink-0">
      <Skeleton className="aspect-[2/3] w-full rounded-lg bg-white/5" />
      <Skeleton className="h-4 w-full rounded bg-white/5" />
      <Skeleton className="h-3 w-3/4 rounded bg-white/5" />
    </div>
  )
}

export function MovieCarousel({ title, movies, loading, viewAllHref, className }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Intersection Observer: only render movies when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // preload 200px before visible
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const updateScrollButtons = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -420 : 420,
      behavior: 'smooth',
    })
  }

  const showContent = isVisible || loading

  return (
    <section ref={sectionRef} className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-[#f31260] rounded-full inline-block" />
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-[#f31260] hover:text-[#e01055] transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="relative group/carousel">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 md:left-8 lg:left-12 top-1/3 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-[#f31260] hover:border-[#f31260] -translate-x-1/2 shadow-lg"
            aria-label="Cuộn trái"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-8 lg:px-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {!showContent
            ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : loading
              ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : movies?.map((movie, index) => (
                <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0">
                  <MovieCard
                    movie={movie}
                    priority={index < 4} // only first 4 eager-load
                  />
                </div>
              ))}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (movies?.length ?? 0) > 4 && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 md:right-8 lg:right-12 top-1/3 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-[#f31260] hover:border-[#f31260] translate-x-1/2 shadow-lg"
            aria-label="Cuộn phải"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  )
}
