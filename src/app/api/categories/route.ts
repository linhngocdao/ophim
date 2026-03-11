import { NextResponse } from 'next/server'
import { getAllCategories } from '@/lib/server/movie-db'

export async function GET() {
  try {
    const data = await getAllCategories()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
