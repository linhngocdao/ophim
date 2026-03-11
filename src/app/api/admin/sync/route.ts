import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/route-auth'
import { syncMoviesFromOPhim } from '@/lib/server/ophim-sync'

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      maxPagesPerType?: number
      maxDetailFetch?: number
    }

    const summary = await syncMoviesFromOPhim({
      maxPagesPerType: payload.maxPagesPerType,
      maxDetailFetch: payload.maxDetailFetch,
    })

    return NextResponse.json({ ok: true, summary })
  } catch (error) {
    console.error('Admin sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
