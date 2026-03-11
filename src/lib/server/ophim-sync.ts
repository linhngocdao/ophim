import { getMongoDb } from '@/lib/server/mongodb'
import type { Movie } from '@/types/movie'
import type { StoredMovieDoc } from '@/types/server'
import { MOVIE_LIST_SLUGS } from '@/lib/movie-list-types'

const OPHIM_BASE_URL = process.env.OPHIM_SOURCE_URL || 'https://ophim1.com'

type SyncSummary = {
  fetchedListPages: number
  fetchedDetails: number
  upsertedMovies: number
  categories: number
  countries: number
}

const LIST_TYPES = MOVIE_LIST_SLUGS

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} (${res.status})`)
  }
  return res.json() as Promise<T>
}

async function syncTaxonomies() {
  const db = await getMongoDb()
  const [categories, countries] = await Promise.all([
    fetchJson<Array<{ name: string; slug: string }>>(`${OPHIM_BASE_URL}/the-loai`),
    fetchJson<Array<{ name: string; slug: string }>>(`${OPHIM_BASE_URL}/quoc-gia`),
  ])

  await Promise.all([
    db.collection('categories').deleteMany({}),
    db.collection('countries').deleteMany({}),
  ])

  if (categories.length) {
    await db.collection('categories').insertMany(
      categories.map((item) => ({
        id: item.slug,
        name: item.name,
        slug: item.slug,
      }))
    )
  }

  if (countries.length) {
    await db.collection('countries').insertMany(
      countries.map((item) => ({
        id: item.slug,
        name: item.name,
        slug: item.slug,
      }))
    )
  }

  return {
    categories: categories.length,
    countries: countries.length,
  }
}

function buildSearchableText(movie: Movie) {
  return [
    movie.name,
    movie.origin_name,
    movie.slug,
    ...(movie.actor || []),
    ...(movie.director || []),
    ...(movie.alternative_names || []),
    ...(movie.category || []).map((c) => c.name),
    ...(movie.country || []).map((c) => c.name),
  ]
    .filter(Boolean)
    .join(' ')
}

export async function syncMoviesFromOPhim(options?: {
  maxPagesPerType?: number
  maxDetailFetch?: number
}): Promise<SyncSummary> {
  const db = await getMongoDb()
  const maxPagesPerType = Math.max(1, Number(options?.maxPagesPerType ?? process.env.CRAWL_MAX_PAGES_PER_TYPE ?? 10))
  const maxDetailFetch = Math.max(1, Number(options?.maxDetailFetch ?? process.env.CRAWL_MAX_DETAIL_FETCH ?? 3000))

  const taxonomy = await syncTaxonomies()
  const slugSet = new Set<string>()
  let fetchedListPages = 0

  for (const type of LIST_TYPES) {
    for (let page = 1; page <= maxPagesPerType; page++) {
      const json = await fetchJson<{ data?: { items?: Array<{ slug: string }> } }>(
        `${OPHIM_BASE_URL}/v1/api/danh-sach/${type}?page=${page}`
      )
      fetchedListPages += 1
      const items = json?.data?.items ?? []
      if (!items.length) break
      for (const item of items) {
        if (item.slug) slugSet.add(item.slug)
      }
    }
  }

  const slugs = Array.from(slugSet).slice(0, maxDetailFetch)
  let fetchedDetails = 0
  let upsertedMovies = 0

  for (const slug of slugs) {
    const detail = await fetchJson<{ data?: { item?: Movie } }>(`${OPHIM_BASE_URL}/v1/api/phim/${slug}`)
    fetchedDetails += 1
    const movie = detail?.data?.item
    if (!movie) continue

    const movieId = movie._id || movie.slug
    await db.collection<StoredMovieDoc>('movies').updateOne(
      { _id: movieId },
      {
        $set: {
          ...movie,
          _id: movieId,
          searchableText: buildSearchableText(movie),
          updatedAt: new Date(),
          source: 'ophim',
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )
    upsertedMovies += 1
  }

  await db.collection<StoredMovieDoc>('movies').createIndex({ slug: 1 }, { unique: true })
  await db.collection<StoredMovieDoc>('movies').createIndex({ searchableText: 'text', name: 'text', origin_name: 'text' })
  await db.collection<StoredMovieDoc>('movies').createIndex({ type: 1, year: -1, updatedAt: -1 })
  await db.collection<StoredMovieDoc>('movies').createIndex({ 'category.slug': 1, updatedAt: -1 })
  await db.collection<StoredMovieDoc>('movies').createIndex({ 'country.slug': 1, updatedAt: -1 })

  return {
    fetchedListPages,
    fetchedDetails,
    upsertedMovies,
    categories: taxonomy.categories,
    countries: taxonomy.countries,
  }
}
