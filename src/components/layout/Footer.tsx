import Link from 'next/link'
import { Film, Facebook, Youtube, Github } from 'lucide-react'
import { MOVIE_LIST_TYPES } from '@/lib/movie-list-types'

const MOVIE_TYPES = MOVIE_LIST_TYPES.map((item) => ({
  label: item.label,
  href: `/danh-sach/${item.slug}`,
}))

const POPULAR_CATEGORIES = [
  { label: 'Hành Động', href: '/the-loai/hanh-dong' },
  { label: 'Tình Cảm', href: '/the-loai/tinh-cam' },
  { label: 'Hài Hước', href: '/the-loai/hai-huoc' },
  { label: 'Kinh Dị', href: '/the-loai/kinh-di' },
  { label: 'Viễn Tưởng', href: '/the-loai/vien-tuong' },
  { label: 'Tâm Lý', href: '/the-loai/tam-ly' },
  { label: 'Phiêu Lưu', href: '/the-loai/phieu-luu' },
  { label: 'Cổ Trang', href: '/the-loai/co-trang' },
]

const POPULAR_COUNTRIES = [
  { label: 'Hàn Quốc', href: '/quoc-gia/han-quoc' },
  { label: 'Trung Quốc', href: '/quoc-gia/trung-quoc' },
  { label: 'Âu Mỹ', href: '/quoc-gia/au-my' },
  { label: 'Nhật Bản', href: '/quoc-gia/nhat-ban' },
  { label: 'Thái Lan', href: '/quoc-gia/thai-lan' },
  { label: 'Hồng Kông', href: '/quoc-gia/hong-kong' },
  { label: 'Đài Loan', href: '/quoc-gia/dai-loan' },
  { label: 'Việt Nam', href: '/quoc-gia/viet-nam' },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16 hidden md:block">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#f31260] flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Nghiền <span className="text-[#f31260]">Phim</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Website xem phim online miễn phí với chất lượng cao, cập nhật nhanh nhất.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-[#f31260] flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Movie Types */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Danh Sách Phim</h3>
            <ul className="space-y-2">
              {MOVIE_TYPES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-[#f31260] text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Thể Loại Phim</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              {POPULAR_CATEGORIES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-[#f31260] text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Phim Theo Quốc Gia</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              {POPULAR_COUNTRIES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-[#f31260] text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Nghiền Phim. Trang web xem phim online chất lượng cao.
          </p>

        </div>
      </div>
    </footer>
  )
}
