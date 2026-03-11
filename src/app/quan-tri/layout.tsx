import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuthToken, getAuthCookieName } from '@/lib/server/auth'

export const metadata: Metadata = {
  title: 'Quản trị',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAuthCookieName())?.value
  const user = token ? verifyAuthToken(token) : null

  if (!user || user.role !== 'admin') {
    redirect('/dang-nhap?next=/quan-tri')
  }

  return <>{children}</>
}
