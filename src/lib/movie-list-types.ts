export type MovieListTypeDef = {
  slug: string
  label: string
}

export const MOVIE_LIST_TYPES: MovieListTypeDef[] = [
  { slug: 'phim-moi-cap-nhat', label: 'Phim Mới Cập Nhật' },
  { slug: 'phim-bo', label: 'Phim Bộ' },
  { slug: 'phim-le', label: 'Phim Lẻ' },
  { slug: 'tv-shows', label: 'TV Shows' },
  { slug: 'hoat-hinh', label: 'Hoạt Hình' },
  { slug: 'phim-vietsub', label: 'Phim Vietsub' },
  { slug: 'phim-thuyet-minh', label: 'Phim Thuyết Minh' },
  { slug: 'phim-long-tien', label: 'Phim Lồng Tiếng' },
  { slug: 'phim-bo-dang-chieu', label: 'Phim Bộ Đang Chiếu' },
  { slug: 'phim-bo-hoan-thanh', label: 'Phim Bộ Hoàn Thành' },
  { slug: 'phim-sap-chieu', label: 'Phim Sắp Chiếu' },
  { slug: 'subteam', label: 'Subteam' },
  { slug: 'phim-chieu-rap', label: 'Phim Chiếu Rạp' },
]

export const MOVIE_LIST_SLUGS = MOVIE_LIST_TYPES.map((item) => item.slug)

export function isSupportedMovieListSlug(type?: string | null) {
  if (!type) return false
  return MOVIE_LIST_SLUGS.includes(type)
}

export function getMovieListLabel(type: string) {
  return MOVIE_LIST_TYPES.find((item) => item.slug === type)?.label
}
