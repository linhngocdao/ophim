'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, Grid2X2, Heart, X, ChevronRight, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMovieStore } from '@/store/useMovieStore'
import { useCategories, useCountries } from '@/hooks/useMovies'
import { useAuthUser } from '@/hooks/useAuth'
import { useState } from 'react'
import { MOVIE_LIST_TYPES } from '@/lib/movie-list-types'

const MOVIE_TYPES = MOVIE_LIST_TYPES.map((item) => ({
  label: item.label,
  href: `/danh-sach/${item.slug}`,
}))

function CategorySheet({ onClose }: { onClose: () => void }) {
  const { data: categories } = useCategories()
  const { data: countries } = useCountries()
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
              <button
                onClick={() => navigate('/de-xuat')}
                className="flex items-center justify-between bg-[#f31260]/10 hover:bg-[#f31260]/20 border border-[#f31260]/30 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left"
              >
                Đề Xuất Cho Bạn
                <ChevronRight className="w-3.5 h-3.5 text-[#f31260] flex-shrink-0" />
              </button>
              <button
                onClick={() => navigate('/lich-su')}
                className="flex items-center justify-between bg-secondary hover:bg-[#f31260]/10 hover:border-[#f31260]/30 border border-border rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left"
              >
                Lịch Sử Xem
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
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
          {countries && countries.length > 0 && (
            <div className="px-5 pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Quốc Gia
              </p>
              <div className="grid grid-cols-3 gap-2">
                {countries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => navigate(`/quoc-gia/${country.slug}`)}
                    className="bg-secondary hover:bg-[#f31260] hover:text-white border border-border hover:border-[#f31260] rounded-xl py-2.5 px-1 text-xs font-medium transition-colors text-center"
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            </div>
          )}
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
  const { data: authUser } = useAuthUser()
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
      label: 'Lịch Sử',
      icon: History,
      isActive: pathname.startsWith('/lich-su'),
      onClick: undefined,
      href: '/lich-su',
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
    ...(authUser?.role === 'admin'
      ? [{
        label: 'Admin',
        icon: Grid2X2,
        isActive: pathname.startsWith('/quan-tri'),
        onClick: undefined,
        href: '/quan-tri',
      }]
      : []),
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
