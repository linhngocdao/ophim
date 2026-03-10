'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, Film, Grid2X2, Heart, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMovieStore } from '@/store/useMovieStore'
import { useCategories } from '@/hooks/useMovies'
import { useState } from 'react'

const MOVIE_TYPES = [
  { label: 'Phim Mới Cập Nhật', href: '/danh-sach/phim-moi-cap-nhat' },
  { label: 'Phim Lẻ', href: '/danh-sach/phim-le' },
  { label: 'Phim Bộ', href: '/danh-sach/phim-bo' },
  { label: 'Hoạt Hình', href: '/danh-sach/hoat-hinh' },
  { label: 'TV Shows', href: '/danh-sach/tv-shows' },
]

const POPULAR_COUNTRIES = [
  { label: 'Hàn Quốc', slug: 'han-quoc' },
  { label: 'Trung Quốc', slug: 'trung-quoc' },
  { label: 'Âu Mỹ', slug: 'au-my' },
  { label: 'Nhật Bản', slug: 'nhat-ban' },
  { label: 'Thái Lan', slug: 'thai-lan' },
  { label: 'Hồng Kông', slug: 'hong-kong' },
  { label: 'Đài Loan', slug: 'dai-loan' },
  { label: 'Việt Nam', slug: 'viet-nam' },
]

function CategorySheet({ onClose }: { onClose: () => void }) {
  const { data: categories } = useCategories()
  const router = useRouter()

  const navigate = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-lg font-bold">Khám Phá</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 pb-8">
          {/* Danh sách */}
          <div className="px-5 pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Danh Sách
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOVIE_TYPES.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="flex items-center justify-between bg-secondary hover:bg-[#f31260]/10 hover:border-[#f31260]/30 border border-border rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left"
                >
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Thể loại */}
          {categories && categories.length > 0 && (
            <div className="px-5 pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Thể Loại
              </p>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/the-loai/${cat.slug}`)}
                    className="bg-secondary hover:bg-[#f31260] hover:text-white border border-border hover:border-[#f31260] rounded-xl py-2.5 px-2 text-xs font-medium transition-colors text-center"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quốc gia */}
          <div className="px-5 pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quốc Gia
            </p>
            <div className="grid grid-cols-4 gap-2">
              {POPULAR_COUNTRIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => navigate(`/quoc-gia/${c.slug}`)}
                  className="bg-secondary hover:bg-[#f31260] hover:text-white border border-border hover:border-[#f31260] rounded-xl py-2.5 px-1 text-xs font-medium transition-colors text-center"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FavoritesSheet({ onClose }: { onClose: () => void }) {
  const { favorites, removeFavorite } = useMovieStore()
  const router = useRouter()
  const IMAGE_CDN = 'https://img.ophim.live/uploads/movies/'

  const getImg = (url: string) => {
    if (!url) return '/placeholder.jpg'
    if (url.startsWith('http')) return url
    return `${IMAGE_CDN}${url}`
  }

  const navigate = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-lg font-bold">
            Phim Yêu Thích
            {favorites.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({favorites.length})
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pb-8">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-5">
              <Heart className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Chưa có phim yêu thích</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Nhấn ❤ khi xem phim để lưu vào đây
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {favorites.map((movie) => (
                <div
                  key={movie._id}
                  className="flex items-center gap-3 bg-secondary/50 rounded-xl p-2 group"
                >
                  {/* Thumbnail */}
                  <button
                    onClick={() => navigate(`/phim/${movie.slug}`)}
                    className="relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImg(movie.thumb_url || movie.poster_url)}
                      alt={movie.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>

                  {/* Info */}
                  <button
                    onClick={() => navigate(`/phim/${movie.slug}`)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="font-medium text-sm line-clamp-2 leading-snug">{movie.name}</p>
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{movie.origin_name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] bg-[#f31260] text-white px-1.5 py-0.5 rounded font-medium uppercase">
                        {movie.quality || 'HD'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{movie.year}</span>
                      {movie.episode_current && (
                        <span className="text-[10px] text-green-500">{movie.episode_current}</span>
                      )}
                    </div>
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeFavorite(movie._id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Xóa khỏi yêu thích"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { favorites } = useMovieStore()
  const [openSheet, setOpenSheet] = useState<'category' | 'favorites' | null>(null)

  const navItems = [
    {
      label: 'Trang Chủ',
      icon: Home,
      isActive: pathname === '/',
      onClick: undefined,
      href: '/',
    },
    {
      label: 'Tìm Kiếm',
      icon: Search,
      isActive: pathname.startsWith('/tim-kiem'),
      onClick: undefined,
      href: '/tim-kiem',
    },
    {
      label: 'Phim Mới',
      icon: Film,
      isActive: pathname.startsWith('/danh-sach') || pathname.startsWith('/phim'),
      onClick: undefined,
      href: '/danh-sach/phim-moi-cap-nhat',
    },
    {
      label: 'Thể Loại',
      icon: Grid2X2,
      isActive: pathname.startsWith('/the-loai') || pathname.startsWith('/quoc-gia'),
      onClick: () => setOpenSheet('category'),
      href: undefined,
    },
    {
      label: 'Yêu Thích',
      icon: Heart,
      isActive: false,
      onClick: () => setOpenSheet('favorites'),
      href: undefined,
      badge: favorites.length,
    },
  ]

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.isActive

            const content = (
              <div className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-colors',
                isActive ? 'text-[#f31260]' : 'text-muted-foreground'
              )}>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#f31260] rounded-full" />
                )}
                <div className="relative">
                  <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                  {item.badge ? (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-[#f31260] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </div>
            )

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className="flex-1 h-full flex">
                  {content}
                </Link>
              )
            }

            return (
              <button key={item.label} className="flex-1 h-full" onClick={item.onClick}>
                {content}
              </button>
            )
          })}
        </div>
      </nav>

      {openSheet === 'category' && <CategorySheet onClose={() => setOpenSheet(null)} />}
      {openSheet === 'favorites' && <FavoritesSheet onClose={() => setOpenSheet(null)} />}
    </>
  )
}
