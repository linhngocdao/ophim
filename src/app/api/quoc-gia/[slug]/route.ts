import { NextRequest, NextResponse } from 'next/server'
import { queryMovies } from '@/lib/server/movie-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = Number(request.nextUrl.searchParams.get('page') || '1')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const data = await queryMovies({
      countrySlug: slug,
      page,
      type: 'phim-moi-cap-nhat',
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Quoc gia by slug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
