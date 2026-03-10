import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://ophim1.com'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword') || ''
  const page = searchParams.get('page') || '1'

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
