import { NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/server/mongodb'
import { requireAdmin } from '@/lib/server/route-auth'

interface BannerPayload {
  title?: string
  subtitle?: string
  imageUrl?: string
  href?: string
  priority?: number
  isActive?: boolean
}

export async function GET() {
  try {
    const db = await getMongoDb()
    const items = await db.collection('banners').find({}, { projection: { _id: 0 } }).sort({ priority: 1 }).toArray()
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error('Banners GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const payload = (await request.json()) as BannerPayload
    if (!payload.title || !payload.imageUrl) {
      return NextResponse.json({ error: 'title và imageUrl là bắt buộc' }, { status: 400 })
    }

    const banner = {
      id: crypto.randomUUID(),
      title: payload.title,
      subtitle: payload.subtitle || '',
      imageUrl: payload.imageUrl,
      href: payload.href || '',
      priority: Number(payload.priority || 0),
      isActive: payload.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const db = await getMongoDb()
    await db.collection('banners').insertOne(banner)
    return NextResponse.json({ data: banner }, { status: 201 })
  } catch (error) {
    console.error('Banners POST error:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
