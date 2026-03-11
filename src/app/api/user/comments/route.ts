import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { buildMovieSnapshot, ensureUserIndexes, getProfileIdFromRequest, isValidProfileId } from '@/lib/server/user-data'
import type { Movie } from '@/types/movie'

interface CommentPayload {
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

export async function GET(request: NextRequest) {
  try {
    await ensureUserIndexes()
    const profileId = getProfileIdFromRequest(request)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    const movieId = request.nextUrl.searchParams.get('movieId')?.trim()
    if (!movieId) {
      return NextResponse.json({ error: 'movieId is required' }, { status: 400 })
    }

    const parentId = request.nextUrl.searchParams.get('parentId')
    const pageParam = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? '10')
    const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 30) : 10

    const db = await getMongoDb()
    const query = {
      movieId,
      parentId: parentId || null,
    }

    const [totalItems, itemsRaw] = await Promise.all([
      db.collection('user_comments').countDocuments(query),
      db.collection('user_comments')
        .find(query, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ])

    const commentIds = itemsRaw.map((item) => item.commentId)
    const userLikes = commentIds.length
      ? await db.collection('user_comment_reactions').find(
        { commentId: { $in: commentIds }, profileId },
        { projection: { _id: 0, commentId: 1 } }
      ).toArray()
      : []

    const likedSet = new Set(userLikes.map((item) => item.commentId))
    const items = itemsRaw.map((item) => ({
      ...item,
      author: buildAuthor(item.profileId),
      likedByMe: likedSet.has(item.commentId),
    }))

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
    console.error('Comments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUserIndexes()
    const payload = (await request.json()) as CommentPayload
    const profileId = getProfileIdFromRequest(request, payload.profileId)
    if (!isValidProfileId(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 })
    }

    if (!payload.movie?._id || !payload.movie.slug || !payload.movie.name) {
      return NextResponse.json({ error: 'Invalid movie payload' }, { status: 400 })
    }

    const content = payload.content?.trim()
    if (!content || content.length < 2) {
      return NextResponse.json({ error: 'Nội dung bình luận quá ngắn' }, { status: 400 })
    }

    const db = await getMongoDb()
    const movieId = payload.movie._id
    const watched = await db.collection('user_history').findOne({ profileId, movieId }, { projection: { _id: 1 } })
    if (!watched) {
      return NextResponse.json(
        { error: 'Bạn cần xem phim trước khi bình luận.' },
        { status: 403 }
      )
    }

    const now = new Date()
    const commentId = crypto.randomUUID()
    const doc = {
      commentId,
      profileId,
      movieId,
      movie: buildMovieSnapshot(payload.movie),
      content: content.slice(0, 1500),
      parentId: null as string | null,
      likeCount: 0,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('user_comments').insertOne(doc)

    return NextResponse.json({
      data: {
        ...doc,
        author: buildAuthor(profileId),
        likedByMe: false,
      },
    })
  } catch (error) {
    console.error('Comments POST error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
