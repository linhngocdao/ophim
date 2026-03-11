import { useQuery } from '@tanstack/react-query'
import {
  getNewMovies,
  getMoviesByType,
  getMovieDetail,
  searchMoviesWithFilters,
  getCategories,
  getMoviesByCategory,
  getCountries,
  getMoviesByCountry,
  getYears,
} from '@/lib/api'

export const useNewMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'new', page],
    queryFn: () => getNewMovies(page),
  })

export const useMoviesByType = (type: string, page = 1) =>
  useQuery({
    queryKey: ['movies', 'type', type, page],
    queryFn: () => getMoviesByType(type, page),
    enabled: !!type,
  })

export const useMovieDetail = (slug: string) =>
  useQuery({
    queryKey: ['movie', slug],
    queryFn: () => getMovieDetail(slug),
    enabled: !!slug,
  })

export const useSearchMovies = (keyword: string, page = 1, filters?: { year?: number; country?: string }) =>
  useQuery({
    queryKey: ['movies', 'search', keyword, page, filters?.year, filters?.country],
    queryFn: () =>
      searchMoviesWithFilters({
        keyword,
        page,
        year: filters?.year,
        country: filters?.country,
      }),
    enabled: keyword.length >= 2 || Boolean(filters?.year) || Boolean(filters?.country),
  })

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000,
  })

export const useMoviesByCategory = (slug: string, page = 1) =>
  useQuery({
    queryKey: ['movies', 'category', slug, page],
    queryFn: () => getMoviesByCategory(slug, page),
    enabled: !!slug,
  })

export const useCountries = () =>
  useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 30 * 60 * 1000,
  })

export const useYears = () =>
  useQuery({
    queryKey: ['years'],
    queryFn: getYears,
    staleTime: 30 * 60 * 1000,
  })

export const useMoviesByCountry = (slug: string, page = 1) =>
  useQuery({
    queryKey: ['movies', 'country', slug, page],
    queryFn: () => getMoviesByCountry(slug, page),
    enabled: !!slug,
  })
