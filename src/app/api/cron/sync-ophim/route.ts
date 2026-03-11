import { NextRequest, NextResponse } from 'next/server'
import { syncMoviesFromOPhim } from '@/lib/server/ophim-sync'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is missing' }, { status: 500 })
  }

  const bearer = request.headers.get('authorization')
  const secretFromBearer = bearer?.startsWith('Bearer ') ? bearer.slice('Bearer '.length).trim() : ''
  const secretFromHeader = request.headers.get('x-cron-secret') || ''

  if (secretFromBearer !== cronSecret && secretFromHeader !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
  }

  try {
    const summary = await syncMoviesFromOPhim({
      maxPagesPerType: Number(process.env.CRON_CRAWL_MAX_PAGES_PER_TYPE || process.env.CRAWL_MAX_PAGES_PER_TYPE || 6),
      maxDetailFetch: Number(process.env.CRON_CRAWL_MAX_DETAIL_FETCH || process.env.CRAWL_MAX_DETAIL_FETCH || 500),
    })

    return NextResponse.json({
      ok: true,
      ranAt: new Date().toISOString(),
      summary,
    })
  } catch (error) {
    console.error('Cron sync failed:', error)
    return NextResponse.json({ error: 'Cron sync failed' }, { status: 500 })
  }
}
