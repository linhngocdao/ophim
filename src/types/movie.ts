export interface Movie {
  _id: string
  name: string
  slug: string
  origin_name: string
  content?: string
  type: 'movie' | 'series' | 'hoathinh' | 'tvshows'
  status?: string
  thumb_url: string
  poster_url: string
  trailer_url?: string
  time?: string
  episode_current?: string
  episode_total?: string
  quality?: string
  lang?: string
  year: number
  actor?: string[]
  director?: string[]
  category: Category[]
  country: Country[]
  chieurap?: boolean
  sub_docquyen?: boolean
  episodes?: Episode[]
  tmdb?: {
    type: string
    id: string
    season?: number
    vote_average?: number
    vote_count?: number
  }
  imdb?: {
    id?: string
    vote_average?: number
    vote_count?: number
  }
  modified?: {
    time: string
  }
  alternative_names?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Country {
  id: string
  name: string
  slug: string
}

export interface Episode {
  server_name: string
  is_ai?: boolean
  server_data: EpisodeItem[]
}

export interface EpisodeItem {
  name: string
  slug: string
  filename: string
  link_embed: string
  link_m3u8: string
}

export interface Pagination {
  totalItems: number
  totalItemsPerPage: number
  currentPage: number
  pageRanges: number
  totalPages?: number
}

export interface MovieListResponse {
  status: string
  message?: string
  data: {
    seoOnPage?: {
      og_type?: string
      titleHead?: string
      descriptionHead?: string
      og_image?: string[]
      og_url?: string
    }
    breadCrumb?: Array<{
      name: string
      slug?: string
      isCurrent?: boolean
      position?: number
    }>
    titlePage?: string
    items: Movie[]
    params: {
      type_slug?: string
      filterCategory?: string[]
      filterCountry?: string[]
      filterYear?: string[]
      filterType?: string
      sortField?: string
      sortType?: string
      pagination: Pagination
    }
    type_list?: string
    APP_DOMAIN_FRONTEND?: string
    APP_DOMAIN_CDN_IMAGE?: string
  }
}

// The movie detail API returns: { status, message, data: { item: Movie (with episodes inside), ... } }
export interface MovieDetailResponse {
  status: string
  message?: string
  data: {
    seoOnPage?: {
      og_type?: string
      titleHead?: string
      descriptionHead?: string
      og_image?: string[]
      og_url?: string
    }
    breadCrumb?: Array<{
      name: string
      slug?: string
      isCurrent?: boolean
      position?: number
    }>
    params?: Record<string, unknown>
    item: Movie
    APP_DOMAIN_CDN_IMAGE?: string
  }
}

export interface SearchParams {
  keyword?: string
  page?: number
  type?: string
  year?: string
  category?: string
  country?: string
  sort_field?: string
}
