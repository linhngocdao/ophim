import { NextRequest, NextResponse } from 'next/server'
import { queryMovies } from '@/lib/server/movie-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params
  const yearNumber = Number(year)
  const page = Number(request.nextUrl.searchParams.get('page') || '1')

  if (!Number.isFinite(yearNumber)) {
    return NextResponse.json({ error: 'Year is invalid' }, { status: 400 })
  }

  try {
    const data = await queryMovies({
      year: yearNumber,
      page,
      type: 'phim-moi-cap-nhat',
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Nam phat hanh by year API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
