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
    title: `Phim ${title} - Xem Online HD | Ophim`,
    description: `Xem phim ${title} online miễn phí tại Ophim. Cập nhật phim ${title} mới nhất, chất lượng HD vietsub, thuyết minh.`,
    keywords: [`phim ${title}`, `xem phim ${title}`, 'phim nước ngoài', title.toLowerCase()],
    openGraph: {
      title: `Phim ${title} | Ophim`,
      description: `Tổng hợp phim ${title} chất lượng HD tại Ophim`,
      locale: 'vi_VN',
      siteName: 'Ophim',
    },
    alternates: { canonical: `/quoc-gia/${slug}` },
  }
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
