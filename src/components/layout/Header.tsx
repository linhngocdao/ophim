'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Film, Search, BookOpen, Heart, History, Sparkles, LogOut, Compass } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useMovieStore } from '@/store/useMovieStore'
import { useCategories, useCountries } from '@/hooks/useMovies'
import { useAuthUser } from '@/hooks/useAuth'
import { SearchBar } from '@/components/ui/SearchBar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { MOVIE_LIST_TYPES } from '@/lib/movie-list-types'

const MOVIE_TYPES = MOVIE_LIST_TYPES.map((item) => ({
  label: item.label,
  href: `/danh-sach/${item.slug}`,
}))

const EXPLORE_LINKS = [
  { label: 'Đề Xuất', href: '/de-xuat', icon: Sparkles },
  { label: 'Yêu Thích', href: '/yeu-thich', icon: Heart },
  { label: 'Lịch Sử', href: '/lich-su', icon: History },
  { label: 'API', href: '/api-doc', icon: BookOpen },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const { data: categories } = useCategories()
  const { data: countries } = useCountries()
  const { favorites } = useMovieStore()
  const { data: authUser } = useAuthUser()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    queryClient.setQueryData(['auth', 'me'], null)
    router.refresh()
    router.push('/')
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  const desktopNavItemClass =
    'px-1 py-2 text-[15px] font-medium text-zinc-300 transition-colors hover:text-white'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || isMenuOpen || isMobileSearchOpen
            ? 'bg-[#0a0a0a] shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-b border-white/10'
            : 'bg-gradient-to-b from-black/80 via-black/55 to-transparent'
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f31260] to-[#ff6b9f] flex items-center justify-center shadow-[0_6px_22px_rgba(243,18,96,0.45)]">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block">
                Nghiền <span className="text-[#f31260]">Phim</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={cn(
                  desktopNavItemClass,
                  pathname === '/'
                    ? 'text-white'
                    : 'text-zinc-300 hover:text-white'
                )}
              >
                Trang Chủ
              </Link>

              {/* Danh Sách dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setOpenDropdown('danh-sach')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  className={cn(
                    `${desktopNavItemClass} flex items-center gap-1.5`,
                    pathname.startsWith('/danh-sach')
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  )}
                >
                  Danh Sách
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'danh-sach' && 'rotate-180')} />
                </button>
                {openDropdown === 'danh-sach' && (
                  <div
                    className="absolute top-full left-0 mt-2 w-[420px] bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-3 z-50"
                    onMouseEnter={() => setOpenDropdown('danh-sach')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <p className="px-1 pb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Danh sách nổi bật</p>
                    <div className="grid grid-cols-2 gap-1">
                      {MOVIE_TYPES.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-lg px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Thể Loại dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setOpenDropdown('the-loai')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  className={cn(
                    `${desktopNavItemClass} flex items-center gap-1.5`,
                    pathname.startsWith('/the-loai')
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  )}
                >
                  Thể Loại
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'the-loai' && 'rotate-180')} />
                </button>
                {openDropdown === 'the-loai' && categories && (
                  <div
                    className="absolute top-full left-0 mt-2 w-[560px] bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-3 z-50"
                    onMouseEnter={() => setOpenDropdown('the-loai')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <p className="px-1 pb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Thể loại</p>
                    <div className="grid max-h-[320px] grid-cols-3 gap-1 overflow-y-auto pr-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/the-loai/${cat.slug}`}
                          className="rounded-lg px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quốc Gia dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setOpenDropdown('quoc-gia')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  className={cn(
                    `${desktopNavItemClass} flex items-center gap-1.5`,
                    pathname.startsWith('/quoc-gia')
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  )}
                >
                  Quốc Gia
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'quoc-gia' && 'rotate-180')} />
                </button>
                {openDropdown === 'quoc-gia' && countries && (
                  <div
                    className="absolute top-full left-0 mt-2 w-[520px] bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-3 z-50"
                    onMouseEnter={() => setOpenDropdown('quoc-gia')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <p className="px-1 pb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Quốc gia</p>
                    <div className="grid max-h-[300px] grid-cols-3 gap-1 overflow-y-auto pr-1">
                      {countries.map((country) => (
                        <Link
                          key={country.id}
                          href={`/quoc-gia/${country.slug}`}
                          className="rounded-lg px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                        >
                          {country.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onMouseEnter={() => setOpenDropdown('kham-pha')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  className={cn(
                    `${desktopNavItemClass} flex items-center gap-1.5`,
                    pathname === '/api-doc' || pathname === '/yeu-thich' || pathname === '/lich-su' || pathname === '/de-xuat'
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  )}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Khám Phá
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'kham-pha' && 'rotate-180')} />
                </button>
                {openDropdown === 'kham-pha' && (
                  <div
                    className="absolute top-full left-0 mt-2 w-[300px] bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-3 z-50"
                    onMouseEnter={() => setOpenDropdown('kham-pha')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <p className="px-1 pb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Khám phá</p>
                    <div className="grid grid-cols-1 gap-1">
                    {EXPLORE_LINKS.map((item) => {
                      const Icon = item.icon
                      const isFav = item.href === '/yeu-thich'
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                          </span>
                          {isFav && favorites.length > 0 && (
                            <span className="min-w-[16px] h-4 bg-[#f31260] text-white text-[9px] font-bold rounded-full inline-flex items-center justify-center px-1">
                              {favorites.length > 99 ? '99+' : favorites.length}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                    </div>
                  </div>
                )}
              </div>

              {authUser?.role === 'admin' && (
                <Link
                  href="/quan-tri"
                  className={cn(
                    `${desktopNavItemClass} flex items-center gap-1`,
                    pathname.startsWith('/quan-tri')
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  )}
                >
                  Quản Trị
                </Link>
              )}

              {authUser ? (
                <>
                  <span className="px-3 py-2 text-sm font-medium text-zinc-300">
                    Xin chào{authUser.name ? `, ${authUser.name}` : ''}
                  </span>
                  <button
                    onClick={() => void logout()}
                    className="flex items-center gap-1 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng Xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/dang-nhap"
                    className={cn(
                      `${desktopNavItemClass}`,
                      pathname.startsWith('/dang-nhap')
                        ? 'text-white'
                        : 'text-zinc-300 hover:text-white'
                    )}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className={cn(
                      'rounded border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium transition-colors',
                      pathname.startsWith('/dang-ky') ? 'text-white' : 'text-zinc-100 hover:bg-white/20'
                    )}
                  >
                    Đăng Ký
                  </Link>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {/* Desktop search */}
              <button
                onClick={() => setIsDesktopSearchOpen(true)}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-zinc-300 hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile search button */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden pb-3">
              <SearchBar className="w-full" autoFocus onClose={() => setIsMobileSearchOpen(false)} />
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/98 border-t border-border max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Trang Chủ
              </Link>

              <Link
                href="/yeu-thich"
                className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Heart className="w-4 h-4" />
                Phim Yêu Thích
                {favorites.length > 0 && (
                  <span className="ml-auto bg-[#f31260] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link
                href="/api-doc"
                className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                API Documentation
              </Link>

              <Link
                href="/lich-su"
                className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <History className="w-4 h-4" />
                Lịch Sử Xem
              </Link>

              <Link
                href="/de-xuat"
                className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Đề Xuất Cá Nhân
              </Link>

              {authUser?.role === 'admin' && (
                <Link
                  href="/quan-tri"
                  className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Quản Trị
                </Link>
              )}

              {authUser ? (
                <div className="space-y-2 px-1 py-1">
                  <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
                    Xin chào{authUser.name ? `, ${authUser.name}` : ''}
                  </p>
                  <button
                    onClick={() => void logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng Xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 px-1 py-1">
                  <Link
                    href="/dang-nhap"
                    className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className="block rounded-lg bg-[#f31260] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Đăng Ký
                  </Link>
                  <Link
                    href="/quen-mat-khau"
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
                  >
                    Quên Mật Khẩu
                  </Link>
                </div>
              )}

              <div>
                <button
                  onClick={() => toggleDropdown('mobile-danh-sach')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Danh Sách
                  <ChevronDown className={cn('w-4 h-4 transition-transform', openDropdown === 'mobile-danh-sach' && 'rotate-180')} />
                </button>
                {openDropdown === 'mobile-danh-sach' && (
                  <div className="pl-4 mt-1 space-y-1 border-l border-border ml-3">
                    {MOVIE_TYPES.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleDropdown('mobile-the-loai')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Thể Loại
                  <ChevronDown className={cn('w-4 h-4 transition-transform', openDropdown === 'mobile-the-loai' && 'rotate-180')} />
                </button>
                {openDropdown === 'mobile-the-loai' && categories && (
                  <div className="pl-4 mt-1 grid grid-cols-2 gap-1 border-l border-border ml-3">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/the-loai/${cat.slug}`}
                        className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleDropdown('mobile-quoc-gia')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Quốc Gia
                  <ChevronDown className={cn('w-4 h-4 transition-transform', openDropdown === 'mobile-quoc-gia' && 'rotate-180')} />
                </button>
                {openDropdown === 'mobile-quoc-gia' && countries && (
                  <div className="pl-4 mt-1 grid grid-cols-2 gap-1 border-l border-border ml-3">
                    {countries.map((country) => (
                      <Link
                        key={country.id}
                        href={`/quoc-gia/${country.slug}`}
                        className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {country.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <Dialog open={isDesktopSearchOpen} onOpenChange={setIsDesktopSearchOpen}>
        <DialogContent className="hidden md:grid w-full max-w-2xl border-white/10 bg-[#101018] p-5">
          <DialogTitle className="text-base font-semibold text-white">Tìm kiếm phim</DialogTitle>
          <SearchBar
            className="w-full"
            autoFocus
            placeholder="Nhập tên phim..."
            onClose={() => setIsDesktopSearchOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
