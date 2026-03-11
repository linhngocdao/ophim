import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const db = await getMongoDb()
    const [categories, countries, years] = await Promise.all([
      db.collection('categories').find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray(),
      db.collection('countries').find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray(),
      db.collection('movies').aggregate([
        { $group: { _id: '$year' } },
        { $sort: { _id: -1 } },
      ]).toArray(),
    ])

    return NextResponse.json({
      categories,
      countries,
      years: years.map((item) => item._id).filter(Boolean),
    })
  } catch (error) {
    console.error('Admin taxonomies GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch taxonomies' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const payload = (await request.json()) as {
      categories?: Array<{ id?: string; name: string; slug: string }>
      countries?: Array<{ id?: string; name: string; slug: string }>
    }
    const db = await getMongoDb()

    if (payload.categories) {
      await db.collection('categories').deleteMany({})
      if (payload.categories.length) {
        await db.collection('categories').insertMany(
          payload.categories.map((item) => ({
            id: item.id || item.slug,
            name: item.name,
            slug: item.slug,
          }))
        )
      }
    }

    if (payload.countries) {
      await db.collection('countries').deleteMany({})
      if (payload.countries.length) {
        await db.collection('countries').insertMany(
          payload.countries.map((item) => ({
            id: item.id || item.slug,
            name: item.name,
            slug: item.slug,
          }))
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin taxonomies PUT error:', error)
    return NextResponse.json({ error: 'Failed to update taxonomies' }, { status: 500 })
  }
}
