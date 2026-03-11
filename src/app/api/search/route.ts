import { NextRequest, NextResponse } from 'next/server'
import { queryMovies } from '@/lib/server/movie-db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword') || ''
  const country = searchParams.get('country') || ''
  const yearRaw = Number(searchParams.get('year') || '')
  const year = Number.isFinite(yearRaw) ? yearRaw : undefined
  const page = Number(searchParams.get('page') || '1')

  if (!keyword && !country && !year) {
    return NextResponse.json({ error: 'At least one filter is required' }, { status: 400 })
  }

  try {
    const data = await queryMovies({
      keyword: keyword || undefined,
      countrySlug: country || undefined,
      year,
      page,
      type: 'phim-moi-cap-nhat',
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
