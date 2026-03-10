import axios from 'axios'
import type { MovieListResponse, MovieDetailResponse, Category, Country } from '@/types/movie'

// Use relative URLs so all requests go through Next.js API routes (proxy) to avoid CORS
const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? '' : 'http://localhost:3000',
  timeout: 15000,
})

export const IMAGE_CDN = 'https://img.ophim.live/uploads/movies/'

export const getImageUrl = (url: string): string => {
  if (!url) return '/placeholder.jpg'
  if (url.startsWith('http')) return url
  return `${IMAGE_CDN}${url}`
}

// Movie Lists
export const getNewMovies = async (page = 1): Promise<MovieListResponse> => {
  const { data } = await apiClient.get('/api/movies', {
    params: { type: 'phim-moi-cap-nhat', page },
  })
  return data
}

export const getMoviesByType = async (type: string, page = 1): Promise<MovieListResponse> => {
  const { data } = await apiClient.get('/api/movies', {
    params: { type, page },
  })
  return data
}

// Movie Detail
export const getMovieDetail = async (slug: string): Promise<MovieDetailResponse> => {
  const { data } = await apiClient.get(`/api/movies/${slug}`)
  return data
}

// Search
export const searchMovies = async (keyword: string, page = 1): Promise<MovieListResponse> => {
  const { data } = await apiClient.get('/api/search', {
    params: { keyword, page },
  })
  return data
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get('/api/categories')
  return data
}

export const getMoviesByCategory = async (slug: string, page = 1): Promise<MovieListResponse> => {
  const { data } = await apiClient.get('/api/categories/movies', {
    params: { slug, page },
  })
  return data
}

// Countries
export const getCountries = async (): Promise<Country[]> => {
  const { data } = await apiClient.get('/api/countries')
  return data
}

export const getMoviesByCountry = async (slug: string, page = 1): Promise<MovieListResponse> => {
  const { data } = await apiClient.get('/api/countries/movies', {
    params: { slug, page },
  })
  return data
}
