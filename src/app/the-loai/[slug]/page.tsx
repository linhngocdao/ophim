'use client'

import { use, useState } from 'react'
import { useMoviesByCategory } from '@/hooks/useMovies'
import { MovieGrid } from '@/components/movies/MovieGrid'
import { Pagination } from '@/components/ui/Pagination'
import { slugToTitle } from '@/lib/utils'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMoviesByCategory(slug, page)

  const title = data?.data?.titlePage || slugToTitle(slug)
  const pagination = data?.data?.params?.pagination
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage)
    : 1

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#f31260] rounded-full" />
            Thể loại: {title}
          </h1>
          {pagination && (
            <p className="text-muted-foreground text-sm mt-2 ml-4">
              {pagination.totalItems.toLocaleString()} phim — Trang {page}/{totalPages}
            </p>
          )}
        </div>

        {/* Movie Grid */}
        <MovieGrid
          movies={data?.data?.items}
          loading={isLoading}
          columns={6}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
