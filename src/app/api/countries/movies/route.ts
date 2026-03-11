import { NextRequest, NextResponse } from 'next/server'
import { queryMovies } from '@/lib/server/movie-db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  const page = Number(searchParams.get('page') || '1')

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
    console.error('Country movies API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
