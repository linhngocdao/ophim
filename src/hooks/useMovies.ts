import { useQuery } from '@tanstack/react-query'
import {
  getNewMovies,
  getMoviesByType,
  getMovieDetail,
  searchMovies,
  getCategories,
  getMoviesByCategory,
  getCountries,
  getMoviesByCountry,
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

export const useSearchMovies = (keyword: string, page = 1) =>
  useQuery({
    queryKey: ['movies', 'search', keyword, page],
    queryFn: () => searchMovies(keyword, page),
    enabled: keyword.length >= 2,
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

export const useMoviesByCountry = (slug: string, page = 1) =>
  useQuery({
    queryKey: ['movies', 'country', slug, page],
    queryFn: () => getMoviesByCountry(slug, page),
    enabled: !!slug,
  })
