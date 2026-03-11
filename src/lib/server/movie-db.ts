import { Filter, Sort } from 'mongodb'
import type { Movie } from '@/types/movie'
import { getMongoDb } from '@/lib/server/mongodb'
import { isSupportedMovieListSlug } from '@/lib/movie-list-types'

const DEFAULT_LIMIT = 24

const TYPE_TO_MOVIE_TYPE: Record<string, string> = {
  'phim-le': 'movie',
  'phim-bo': 'series',
  'hoat-hinh': 'hoathinh',
  'tv-shows': 'tvshows',
}

const LIST_TYPE_FILTERS: Record<string, Filter<Movie>> = {
  'phim-vietsub': {
    lang: { $regex: 'vietsub|phu de|phụ đề|sub', $options: 'i' } as never,
  },
  'phim-thuyet-minh': {
    lang: { $regex: 'thuyet minh|thuyết minh|dub', $options: 'i' } as never,
  },
  'phim-long-tien': {
    lang: { $regex: 'long tien|lồng tiếng|lồng', $options: 'i' } as never,
  },
  'phim-bo-dang-chieu': {
    type: 'series',
    episode_current: { $not: { $regex: 'hoan tat|hoàn tất|full', $options: 'i' } } as never,
  },
  'phim-bo-hoan-thanh': {
    type: 'series',
    $or: [
      { episode_current: { $regex: 'hoan tat|hoàn tất|full', $options: 'i' } as never },
      { status: { $regex: 'completed|hoan thanh|hoàn thành', $options: 'i' } as never },
    ],
  },
  'phim-sap-chieu': {
    $or: [
      { status: { $regex: 'sap chieu|sắp chiếu|coming soon|upcoming', $options: 'i' } as never },
      { episode_current: { $regex: 'sap chieu|sắp chiếu|trailer', $options: 'i' } as never },
    ],
  },
  subteam: {
    sub_docquyen: true,
  },
  'phim-chieu-rap': {
    chieurap: true,
  },
}

export interface MovieListQueryInput {
  page?: number
  limit?: number
  type?: string
  categorySlug?: string
  countrySlug?: string
  year?: number
  keyword?: string
}

function normalizePage(page?: number) {
  return Math.max(1, Number.isFinite(page) ? Number(page) : 1)
}

function normalizeLimit(limit?: number) {
  const value = Number.isFinite(limit) ? Number(limit) : DEFAULT_LIMIT
  return Math.min(Math.max(value, 1), 60)
}

function buildMovieFilter(input: MovieListQueryInput): Filter<Movie> {
  const filter: Filter<Movie> = {}
  const typeSlug = input.type?.trim()

  if (typeSlug && TYPE_TO_MOVIE_TYPE[typeSlug]) {
    filter.type = TYPE_TO_MOVIE_TYPE[typeSlug] as Movie['type']
  }

  if (typeSlug && LIST_TYPE_FILTERS[typeSlug]) {
    Object.assign(filter, LIST_TYPE_FILTERS[typeSlug])
  }

  if (input.categorySlug) {
    filter['category.slug'] = input.categorySlug
  }

  if (input.countrySlug) {
    filter['country.slug'] = input.countrySlug
  }

  if (input.year) {
    filter.year = input.year
  }

  if (input.keyword?.trim()) {
    const keyword = input.keyword.trim()
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { origin_name: { $regex: keyword, $options: 'i' } },
      { slug: { $regex: keyword, $options: 'i' } },
      { alternative_names: { $elemMatch: { $regex: keyword, $options: 'i' } } },
    ]
  }

  return filter
}

function getSortByType(type?: string): Sort {
  if (type === 'phim-moi-cap-nhat') {
    return { 'modified.time': -1, updatedAt: -1 }
  }
  return { updatedAt: -1, year: -1 }
}

function safeMovie(item: Partial<Movie>): Movie {
  return {
    _id: String(item._id || ''),
    name: item.name || '',
    slug: item.slug || '',
    origin_name: item.origin_name || item.name || '',
    content: item.content || '',
    type: (item.type || 'movie') as Movie['type'],
    status: item.status || '',
    thumb_url: item.thumb_url || '',
    poster_url: item.poster_url || '',
    trailer_url: item.trailer_url || '',
    time: item.time || '',
    episode_current: item.episode_current || '',
    episode_total: item.episode_total || '',
    quality: item.quality || '',
    lang: item.lang || '',
    year: Number(item.year || 0),
    actor: item.actor || [],
    director: item.director || [],
    category: item.category || [],
    country: item.country || [],
    chieurap: item.chieurap || false,
    sub_docquyen: item.sub_docquyen || false,
    episodes: item.episodes || [],
    tmdb: item.tmdb || { type: '', id: '' },
    imdb: item.imdb || {},
    modified: item.modified || { time: new Date().toISOString() },
    alternative_names: item.alternative_names || [],
  }
}

export async function queryMovies(input: MovieListQueryInput) {
  const db = await getMongoDb()
  const page = normalizePage(input.page)
  const limit = normalizeLimit(input.limit)
  const filter = buildMovieFilter(input)
  const sort = getSortByType(input.type)

  const [totalItems, rawItems] = await Promise.all([
    db.collection<Movie>('movies').countDocuments(filter),
    db.collection<Movie>('movies')
      .find(filter, { projection: { searchableText: 0 } as never })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
  ])

  const items = rawItems.map((item) => safeMovie(item))

  const totalItemsPerPage = limit
  const totalPages = Math.max(1, Math.ceil(totalItems / totalItemsPerPage))

  const typeSlug = isSupportedMovieListSlug(input.type) ? input.type : 'phim-moi-cap-nhat'

  return {
    status: 'success',
    data: {
      items,
      params: {
        type_slug: typeSlug,
        pagination: {
          totalItems,
          totalItemsPerPage,
          currentPage: page,
          pageRanges: 5,
          totalPages,
        },
      },
    },
  }
}

export async function getMovieBySlug(slug: string) {
  const db = await getMongoDb()
  const movie = await db.collection<Movie>('movies').findOne(
    { slug },
    { projection: { searchableText: 0 } as never }
  )

  if (!movie) return null

  return {
    status: 'success',
    data: {
      item: safeMovie(movie),
    },
  }
}

export async function getAllCategories() {
  const db = await getMongoDb()
  return db.collection('categories').find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray()
}

export async function getAllCountries() {
  const db = await getMongoDb()
  return db.collection('countries').find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray()
}

export async function getAllYears() {
  const db = await getMongoDb()
  const docs = await db.collection<Movie>('movies').aggregate<{ _id: number }>([
    { $match: { year: { $type: 'number', $gte: 1900 } } },
    { $group: { _id: '$year' } },
    { $sort: { _id: -1 } },
  ]).toArray()
  return docs.map((item) => item._id).filter(Boolean)
}
