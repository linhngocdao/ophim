import { NextRequest, NextResponse } from 'next/server'
import { getMovieBySlug } from '@/lib/server/movie-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const data = await getMovieBySlug(slug)
    if (!data) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
