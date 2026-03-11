import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getMovieListLabel } from '@/lib/movie-list-types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTypeLabel(type: string): string {
  const listLabel = getMovieListLabel(type)
  if (listLabel) return listLabel

  const typeMap: Record<string, string> = {
    movie: 'Phim Lẻ',
    series: 'Phim Bộ',
    hoathinh: 'Hoạt Hình',
    tvshows: 'TV Shows',
    'phim-le': 'Phim Lẻ',
    'phim-bo': 'Phim Bộ',
    'hoat-hinh': 'Hoạt Hình',
    'tv-shows': 'TV Shows',
  }
  return typeMap[type] || type
}

export function formatEpisode(episodeCurrent?: string, episodeTotal?: string): string {
  if (!episodeCurrent) return ''
  if (episodeCurrent.toLowerCase().includes('hoàn tất') || episodeCurrent.toLowerCase().includes('full')) {
    return episodeCurrent
  }
  if (episodeTotal) {
    return `${episodeCurrent}/${episodeTotal}`
  }
  return episodeCurrent
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function buildSearchParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  return searchParams.toString()
}
