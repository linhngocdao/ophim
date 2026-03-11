import { NextResponse } from 'next/server'
import { getAllYears } from '@/lib/server/movie-db'

export async function GET() {
  try {
    const years = await getAllYears()
    return NextResponse.json(years)
  } catch (error) {
    console.error('Years API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
