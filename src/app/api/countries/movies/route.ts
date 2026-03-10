import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://ophim1.com'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  const page = searchParams.get('page') || '1'

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/api/quoc-gia/${slug}?page=${page}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch country movies' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Country movies API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
