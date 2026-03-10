import { NextResponse } from 'next/server'

const BASE_URL = 'https://ophim1.com'

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/quoc-gia`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Countries API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
