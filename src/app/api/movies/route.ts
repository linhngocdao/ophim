import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://ophim1.com'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'phim-moi-cap-nhat'
  const page = searchParams.get('page') || '1'

  try {
    const res = await fetch(`${BASE_URL}/v1/api/danh-sach/${type}?page=${page}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch movies' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
