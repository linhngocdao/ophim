import { NextResponse } from 'next/server'
import { getAllCountries } from '@/lib/server/movie-db'

export async function GET() {
  try {
    const data = await getAllCountries()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Countries API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
