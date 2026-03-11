import type { MetadataRoute } from 'next'
import { getMongoDb } from '@/lib/server/mongodb'
import type { Movie } from '@/types/movie'
import { MOVIE_LIST_SLUGS } from '@/lib/movie-list-types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/tim-kiem',
    '/de-xuat',
    '/yeu-thich',
    '/lich-su',
    ...MOVIE_LIST_SLUGS.map((slug) => `/danh-sach/${slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.7,
  }))

  try {
    const db = await getMongoDb()
    const movies = await db.collection<Movie>('movies')
      .find({}, { projection: { slug: 1, modified: 1 } as never })
      .limit(5000)
      .toArray()

    const movieRoutes: MetadataRoute.Sitemap = movies
      .filter((movie) => movie.slug)
      .map((movie) => ({
        url: `${baseUrl}/phim/${movie.slug}`,
        lastModified: movie.modified?.time ? new Date(movie.modified.time) : new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }))

    return [...staticRoutes, ...movieRoutes]
  } catch {
    return staticRoutes
  }
}
