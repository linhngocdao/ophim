import { NextRequest, NextResponse } from 'next/server'
import { queryMovies } from '@/lib/server/movie-db'
import { isSupportedMovieListSlug } from '@/lib/movie-list-types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const inputType = searchParams.get('type')
  const type = isSupportedMovieListSlug(inputType) ? String(inputType) : 'phim-moi-cap-nhat'
  const page = Number(searchParams.get('page') || '1')
  const year = Number(searchParams.get('year') || '')

  try {
    const data = await queryMovies({
      type,
      page,
      year: Number.isFinite(year) ? year : undefined,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
