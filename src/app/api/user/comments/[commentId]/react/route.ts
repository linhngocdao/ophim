import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await ensureUserIndexes()
    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const { commentId } = await params
    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
    }

    const db = await getMongoDb()
    const comment = await db.collection('user_comments').findOne(
      { commentId },
      { projection: { _id: 0, commentId: 1 } }
    )
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const existing = await db.collection('user_comment_reactions').findOne(
      { commentId, profileId },
      { projection: { _id: 0, commentId: 1 } }
    )

    if (existing) {
      await Promise.all([
        db.collection('user_comment_reactions').deleteOne({ commentId, profileId }),
        db.collection('user_comments').updateOne({ commentId }, { $inc: { likeCount: -1 } }),
      ])
      return NextResponse.json({ liked: false })
    }

    await Promise.all([
      db.collection('user_comment_reactions').insertOne({
        commentId,
        profileId,
        createdAt: new Date(),
      }),
      db.collection('user_comments').updateOne({ commentId }, { $inc: { likeCount: 1 } }),
    ])
    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('Comment react error:', error)
    return NextResponse.json({ error: 'Failed to react comment' }, { status: 500 })
  }
}
