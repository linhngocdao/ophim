import { NextRequest, NextResponse } from 'next/server'
import { queryMovies } from '@/lib/server/movie-db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = Number(searchParams.get('year') || '')
  const page = Number(searchParams.get('page') || '1')

  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: 'Year is required' }, { status: 400 })
  }

  try {
    const data = await queryMovies({
      year,
      page,
      type: 'phim-moi-cap-nhat',
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Year movies API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
