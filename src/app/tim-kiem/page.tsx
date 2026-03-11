'use client'

import { Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Sparkles, TrendingUp } from 'lucide-react'
import { useCountries, useNewMovies, useSearchMovies, useYears } from '@/hooks/useMovies'
import { usePersonalizedRecommendations } from '@/hooks/usePersonalization'
import { MovieGrid } from '@/components/movies/MovieGrid'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBar } from '@/components/ui/SearchBar'
import { MovieCard } from '@/components/movies/MovieCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function SearchContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const country = searchParams.get('country') || ''
  const yearParam = searchParams.get('year')
  const parsedYear = yearParam ? Number(yearParam) : undefined
  const selectedYear = parsedYear && Number.isFinite(parsedYear) ? parsedYear : undefined
  const pageFromQuery = Number(searchParams.get('page') || '1')
  const page = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1

  const { data, isLoading } = useSearchMovies(keyword, page, {
    year: selectedYear,
    country: country || undefined,
  })
  const { data: countries } = useCountries()
  const { data: years } = useYears()
  const { data: suggestedByTaste } = usePersonalizedRecommendations(12)
  const { data: newMovies } = useNewMovies(1)
  const starterSuggestions = (suggestedByTaste?.length ? suggestedByTaste : newMovies?.data?.items ?? []).slice(0, 8)
  const searchSuggestions = [
    ...(data?.data?.items?.slice(0, 6) ?? []),
    ...(suggestedByTaste?.slice(0, 6) ?? []),
  ]
    .filter((movie, index, arr) => arr.findIndex((m) => m._id === movie._id) === index)
    .slice(0, 8)
  const hasActiveFilters = Boolean(keyword || country || selectedYear)
  const selectedCountryLabel = countries?.find((item) => item.slug === country)?.name

  const pagination = data?.data?.params?.pagination
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage)
    : 1

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams.toString())
    if (keyword) next.set('keyword', keyword)
    next.set('page', String(newPage))
    router.push(`${pathname}?${next.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateFilter = (nextValue: { country?: string; year?: string }) => {
    const next = new URLSearchParams(searchParams.toString())
    if (nextValue.country !== undefined) {
      if (nextValue.country) next.set('country', nextValue.country)
      else next.delete('country')
    }
    if (nextValue.year !== undefined) {
      if (nextValue.year) next.set('year', nextValue.year)
      else next.delete('year')
    }
    next.set('page', '1')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Search header */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#f31260] rounded-full" />
            Tìm kiếm phim
          </h1>

          {/* Search bar */}
          <div className="max-w-xl">
            <SearchBar className="w-full" placeholder="Nhập tên phim..." />
          </div>

          <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={country || '__all_country'}
              onValueChange={(value) => updateFilter({ country: !value || value === '__all_country' ? '' : value })}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-[#13131c] px-3 text-sm text-zinc-200">
                <SelectValue>{selectedCountryLabel || 'Lọc theo quốc gia'}</SelectValue>
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141421] text-zinc-200">
                <SelectItem value="__all_country">Lọc theo quốc gia</SelectItem>
                {(countries || []).map((item) => (
                  <SelectItem key={item.slug} value={item.slug}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear ? String(selectedYear) : '__all_year'}
              onValueChange={(value) => updateFilter({ year: !value || value === '__all_year' ? '' : value })}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-[#13131c] px-3 text-sm text-zinc-200">
                <SelectValue>{selectedYear ? String(selectedYear) : 'Lọc theo năm phát hành'}</SelectValue>
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141421] text-zinc-200">
                <SelectItem value="__all_year">Lọc theo năm phát hành</SelectItem>
                {(years || []).map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Search className="w-4 h-4" />
              {isLoading ? (
                <span>Đang lọc dữ liệu phim...</span>
              ) : (
                <span>
                  {pagination
                    ? `Tìm thấy ${pagination.totalItems.toLocaleString()} kết quả — Trang ${page}/${totalPages}`
                    : 'Không có kết quả phù hợp bộ lọc'}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {starterSuggestions.length > 0 && !hasActiveFilters && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.06 }}
            className="mb-10"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
                <Sparkles className="h-4 w-4 text-[#f31260]" />
                Gợi ý cho bạn
              </h2>
              <Link href="/de-xuat" className="text-sm text-[#f31260] hover:text-[#e01055]">
                Xem thêm
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {starterSuggestions.map((movie, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  <MovieCard movie={movie} priority={index < 4} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* No keyword state */}
        {!hasActiveFilters && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Tìm kiếm phim yêu thích
            </h2>
            <p className="text-gray-600 text-sm max-w-sm">
              Nhập tên phim hoặc chọn bộ lọc năm/quốc gia để khám phá nhanh
            </p>
          </div>
        )}

        {/* Keyword too short */}
        {keyword && keyword.length < 2 && !country && !selectedYear && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500">Nhập ít nhất 2 ký tự để tìm kiếm</p>
          </div>
        )}

        {/* Results */}
        {(keyword.length >= 2 || country || selectedYear) && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Kết quả phim</h2>
            </div>

            {searchSuggestions.length > 0 && keyword.length >= 2 && (
              <motion.section
                className="mb-8 rounded-2xl border border-white/10 bg-[#12121a] p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-300">
                  <TrendingUp className="h-4 w-4 text-[#f31260]" />
                  Gợi ý liên quan
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {searchSuggestions.map((movie) => (
                    <Link
                      key={movie._id}
                      href={`/phim/${movie.slug}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-[#f31260]/50 transition-colors"
                    >
                      <p className="line-clamp-1 text-sm font-medium text-white">{movie.name}</p>
                      <p className="line-clamp-1 text-xs text-zinc-400">{movie.origin_name}</p>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

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
