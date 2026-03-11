import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1))
    const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || 20)))
    const db = await getMongoDb()

    const [totalItems, items] = await Promise.all([
      db.collection('user_comments').countDocuments({}),
      db.collection('user_comments')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ])

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    })
  } catch (error) {
    console.error('Admin comments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const commentId = request.nextUrl.searchParams.get('commentId')
    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
    }

    const db = await getMongoDb()
    const target = await db.collection('user_comments').findOne({ commentId }, { projection: { parentId: 1 } })
    if (!target) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await db.collection('user_comments').deleteMany({
      $or: [{ commentId }, { parentId: commentId }],
    })
    await db.collection('user_comment_reactions').deleteMany({ commentId })

    if (target.parentId) {
      await db.collection('user_comments').updateOne(
        { commentId: target.parentId },
        { $inc: { replyCount: -1 }, $set: { updatedAt: new Date() } }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin comments DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
