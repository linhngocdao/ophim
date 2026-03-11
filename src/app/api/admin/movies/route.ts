import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'
import type { Movie } from '@/types/movie'

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)))
    const keyword = searchParams.get('keyword')?.trim()

    const db = await getMongoDb()
    const filter = keyword
      ? {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { origin_name: { $regex: keyword, $options: 'i' } },
          { slug: { $regex: keyword, $options: 'i' } },
        ],
      }
      : {}

    const [totalItems, items] = await Promise.all([
      db.collection<Movie>('movies').countDocuments(filter),
      db.collection<Movie>('movies')
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ])

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    })
  } catch (error) {
    console.error('Admin movies GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const payload = (await request.json()) as Partial<Movie>
    if (!payload.slug || !payload.name) {
      return NextResponse.json({ error: 'slug và name là bắt buộc' }, { status: 400 })
    }

    const db = await getMongoDb()
    const existing = await db.collection<Movie>('movies').findOne(
      { slug: payload.slug },
      { projection: { _id: 1 } }
    )
    if (existing) {
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 })
    }

    const movieId = String(payload._id || crypto.randomUUID())
    const now = new Date()
    const movie: Movie & { createdAt: Date; updatedAt: Date } = {
      _id: movieId,
      name: payload.name,
      slug: payload.slug,
      origin_name: payload.origin_name || payload.name,
      content: payload.content || '',
      type: payload.type || 'movie',
      status: payload.status || '',
      thumb_url: payload.thumb_url || '',
      poster_url: payload.poster_url || '',
      trailer_url: payload.trailer_url || '',
      time: payload.time || '',
      episode_current: payload.episode_current || '',
      episode_total: payload.episode_total || '',
      quality: payload.quality || '',
      lang: payload.lang || '',
      year: payload.year || new Date().getFullYear(),
      actor: payload.actor || [],
      director: payload.director || [],
      category: payload.category || [],
      country: payload.country || [],
      chieurap: payload.chieurap || false,
      sub_docquyen: payload.sub_docquyen || false,
      episodes: payload.episodes || [],
      tmdb: payload.tmdb || { type: '', id: '' },
      imdb: payload.imdb || {},
      modified: payload.modified || { time: now.toISOString() },
      alternative_names: payload.alternative_names || [],
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('movies').insertOne(movie as never)
    return NextResponse.json({ data: movie }, { status: 201 })
  } catch (error) {
    console.error('Admin movies POST error:', error)
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 })
  }
}
