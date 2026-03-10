'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useSearchMovies } from '@/hooks/useMovies'
import { MovieGrid } from '@/components/movies/MovieGrid'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBar } from '@/components/ui/SearchBar'

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSearchMovies(keyword, page)

  // Reset page when keyword changes
  useEffect(() => {
    setPage(1)
  }, [keyword])

  const pagination = data?.data?.params?.pagination
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage)
    : 1

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Search header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#f31260] rounded-full" />
            Tìm kiếm phim
          </h1>

          {/* Search bar */}
          <div className="max-w-xl">
            <SearchBar className="w-full" placeholder="Nhập tên phim..." />
          </div>

          {keyword && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Search className="w-4 h-4" />
              {isLoading ? (
                <span>Đang tìm kiếm &ldquo;{keyword}&rdquo;...</span>
              ) : (
                <span>
                  {pagination
                    ? `Tìm thấy ${pagination.totalItems.toLocaleString()} kết quả cho "${keyword}" — Trang ${page}/${totalPages}`
                    : `Không có kết quả cho "${keyword}"`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* No keyword state */}
        {!keyword && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Tìm kiếm phim yêu thích
            </h2>
            <p className="text-gray-600 text-sm max-w-sm">
              Nhập tên phim vào ô tìm kiếm để tìm phim bạn muốn xem
            </p>
          </div>
        )}

        {/* Keyword too short */}
        {keyword && keyword.length < 2 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500">Nhập ít nhất 2 ký tự để tìm kiếm</p>
          </div>
        )}

        {/* Results */}
        {keyword && keyword.length >= 2 && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Đang tải...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
