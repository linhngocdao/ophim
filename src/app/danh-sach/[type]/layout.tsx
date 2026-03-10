import type { Metadata } from 'next'
import { getTypeLabel } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const title = getTypeLabel(type)

  return {
    title: `${title} - Xem Online HD | Ophim`,
    description: `Xem ${title.toLowerCase()} online miễn phí tại Ophim. Cập nhật nhanh nhất, chất lượng HD, vietsub và thuyết minh.`,
    keywords: [title.toLowerCase(), 'xem phim online', 'phim hd', 'vietsub', 'thuyết minh'],
    openGraph: {
      title: `${title} | Ophim`,
      description: `Tổng hợp ${title.toLowerCase()} chất lượng cao tại Ophim`,
      locale: 'vi_VN',
      siteName: 'Ophim',
    },
    alternates: { canonical: `/danh-sach/${type}` },
  }
}

export default function ListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
