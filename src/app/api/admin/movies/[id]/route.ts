import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'
import type { Movie } from '@/types/movie'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const db = await getMongoDb()
    const movie = await db.collection<Movie>('movies').findOne({ _id: id })
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    return NextResponse.json({ data: movie })
  } catch (error) {
    console.error('Admin movie GET by id error:', error)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const payload = (await request.json()) as Partial<Movie>
    const db = await getMongoDb()

    const updateData: Record<string, unknown> = { ...payload, updatedAt: new Date() }
    delete updateData._id

    const result = await db.collection<Movie>('movies').findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Admin movie PUT error:', error)
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const db = await getMongoDb()
    const deleted = await db.collection<Movie>('movies').deleteOne({ _id: id })
    if (!deleted.deletedCount) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin movie DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}
