import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const payload = (await request.json()) as Record<string, unknown>
    const updateData: Record<string, unknown> = { ...payload, updatedAt: new Date() }
    delete updateData.id

    const db = await getMongoDb()
    const updated = await db.collection('banners').findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after', projection: { _id: 0 } }
    )
    if (!updated) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Banner PUT error:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
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
    const deleted = await db.collection('banners').deleteOne({ id })
    if (!deleted.deletedCount) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Banner DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}
