import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { buildMovieSnapshot, ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'
import type { Movie } from '@/types/movie'

interface ReplyPayload {
  profileId?: string
  movie?: Movie
  content?: string
}

function buildAuthor(profileId: string) {
  const short = profileId.slice(0, 6).toUpperCase()
  return {
    id: profileId,
    name: `User ${short}`,
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await ensureUserIndexes()
    const payload = (await request.json()) as ReplyPayload
    const profileId = getProfileIdFromRequest(request, payload.profileId)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const { commentId } = await params
    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
    }

    if (!payload.movie?._id || !payload.movie.slug || !payload.movie.name) {
      return NextResponse.json({ error: 'Invalid movie payload' }, { status: 400 })
    }

    const content = payload.content?.trim()
    if (!content || content.length < 2) {
      return NextResponse.json({ error: 'Nội dung phản hồi quá ngắn' }, { status: 400 })
    }

    const db = await getMongoDb()
    const movieId = payload.movie._id
    const [parentComment, watched] = await Promise.all([
      db.collection('user_comments').findOne(
        { commentId, movieId, parentId: null },
        { projection: { _id: 0, commentId: 1 } }
      ),
      db.collection('user_history').findOne({ profileId, movieId }, { projection: { _id: 1 } }),
    ])

    if (!parentComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }
    if (!watched) {
      return NextResponse.json(
        { error: 'Bạn cần xem phim trước khi phản hồi.' },
        { status: 403 }
      )
    }

    const now = new Date()
    const replyId = crypto.randomUUID()
    const doc = {
      commentId: replyId,
      profileId,
      movieId,
      movie: buildMovieSnapshot(payload.movie),
      content: content.slice(0, 1500),
      parentId: commentId,
      likeCount: 0,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await Promise.all([
      db.collection('user_comments').insertOne(doc),
      db.collection('user_comments').updateOne(
        { commentId, movieId, parentId: null },
        { $inc: { replyCount: 1 }, $set: { updatedAt: now } }
      ),
    ])

    return NextResponse.json({
      data: {
        ...doc,
        author: buildAuthor(profileId),
        likedByMe: false,
      },
    })
  } catch (error) {
    console.error('Replies POST error:', error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}
