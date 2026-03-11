import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { WelcomeModal } from '@/components/ui/WelcomeModal'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ophim.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nghiền Phim - Xem Phim Online Miễn Phí HD',
    template: '%s | Nghiền Phim',
  },
  description:
    'Xem phim online miễn phí chất lượng HD. Cập nhật phim mới nhanh nhất - Phim lẻ, phim bộ, hoạt hình, TV shows vietsub, thuyết minh. Kho phim khổng lồ với hơn 34.000 bộ phim.',
  keywords: [
    'xem phim',
    'phim online',
    'phim miễn phí',
    'phim HD',
    'vietsub',
    'thuyết minh',
    'phim lẻ',
    'phim bộ',
    'hoạt hình',
    'phim chiếu rạp',
    'nghiền phim',
  ],
  authors: [{ name: 'Nghiền Phim' }],
  creator: 'Nghiền Phim',
  publisher: 'Nghiền Phim',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'Nghiền Phim',
    title: 'Nghiền Phim - Xem Phim Online Miễn Phí HD',
    description: 'Xem phim online miễn phí chất lượng HD. Kho phim khổng lồ hơn 34.000 bộ phim.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nghiền Phim - Xem Phim Online Miễn Phí HD',
    description: 'Xem phim online miễn phí chất lượng HD tại Nghiền Phim',
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://img.ophim.live" />
        <link rel="dns-prefetch" href="https://img.ophim.live" />
        <link rel="preconnect" href="https://ophim1.com" />
      </head>
      <body
        className="antialiased bg-background text-foreground min-h-screen"
        suppressHydrationWarning
      >
        <Providers>
          {/* Header chỉ hiện trên desktop (md+) */}
          <div className="hidden md:block">
            <Header />
          </div>
          {/* Mobile: không có header, chỉ có bottom nav → không cần pt-16 */}
          <main className="md:pt-16 pb-16 md:pb-0 min-h-screen">{children}</main>
          <Footer />
          <MobileNav />
          <WelcomeModal />
        </Providers>
      </body>
    </html>
  )
}
