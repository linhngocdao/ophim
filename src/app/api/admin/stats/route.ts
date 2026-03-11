import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const db = await getMongoDb()
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)
    const sevenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)

    const [totalUsers, newUsers, totalMovies, totalWatchEvents, featuredMovies, newWatchers] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('users').countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      db.collection('movies').countDocuments({}),
      db.collection('user_history').countDocuments({}),
      db.collection('user_favorites')
        .aggregate([
          { $group: { _id: '$movieId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
      db.collection('user_history').countDocuments({ watchedAt: { $gte: sevenDaysAgo } }),
    ])

    return NextResponse.json({
      totalUsers,
      newUsersLast30Days: newUsers,
      totalMovies,
      totalViews: totalWatchEvents,
      activeWatchersLast7Days: newWatchers,
      featuredMovies,
    })
  } catch (error) {
    console.error('Admin stats GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
