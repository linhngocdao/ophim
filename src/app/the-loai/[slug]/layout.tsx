import type { Metadata } from 'next'
import { slugToTitle } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const title = slugToTitle(slug)

  return {
    title: `Phim Thể Loại ${title} - Xem Online HD | Ophim`,
    description: `Xem phim thể loại ${title} online miễn phí, cập nhật mới nhất tại Ophim. Chất lượng HD, không quảng cáo.`,
    keywords: [`phim ${title}`, 'xem phim online', 'phim hd', title.toLowerCase()],
    openGraph: {
      title: `Phim ${title} | Ophim`,
      description: `Tổng hợp phim thể loại ${title} chất lượng cao tại Ophim`,
      locale: 'vi_VN',
      siteName: 'Ophim',
    },
    alternates: { canonical: `/the-loai/${slug}` },
  }
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
