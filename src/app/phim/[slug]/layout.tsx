import type { Metadata } from 'next'

const BASE_URL = 'https://ophim1.com'
const IMAGE_CDN = 'https://img.ophim.live/uploads/movies/'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    // 4-second timeout to avoid blocking page render
    const res = await fetch(`${BASE_URL}/v1/api/phim/${slug}`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error('fetch failed')

    const json = await res.json()
    const movie = json?.data?.item

    if (!movie) throw new Error('no movie')

    const rawContent: string = movie.content ?? ''
    const description =
      rawContent.replace(/<[^>]*>/g, '').slice(0, 160) ||
      `Xem phim ${movie.name} online miễn phí HD tại Nghiền Phim.`

    const thumb: string = movie.thumb_url ?? ''
    const imageUrl = thumb.startsWith('http') ? thumb : `${IMAGE_CDN}${thumb}`

    const cats: Array<{ name: string }> = movie.category ?? []
    const actors: string[] = movie.actor ?? []

    return {
      title: `${movie.name} (${movie.year}) - Xem Phim Online HD`,
      description,
      keywords: [
        movie.name,
        movie.origin_name,
        'xem phim',
        'phim online',
        ...cats.map((c) => c.name),
        ...actors.slice(0, 5),
      ].filter(Boolean),
      openGraph: {
        title: `${movie.name} | Nghiền Phim`,
        description,
        images: [{ url: imageUrl, width: 800, height: 1200, alt: movie.name }],
        type: 'video.movie',
        locale: 'vi_VN',
        siteName: 'Nghiền Phim',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${movie.name} | Nghiền Phim`,
        description,
        images: [imageUrl],
      },
      alternates: { canonical: `/phim/${slug}` },
    }
  } catch {
    // Always fall back — never block render
    return {
      title: 'Xem Phim Online HD | Nghiền Phim',
      description: 'Xem phim online miễn phí chất lượng HD tại Nghiền Phim.',
    }
  }
}

export default function MovieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
