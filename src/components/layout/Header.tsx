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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || isMenuOpen || isMobileSearchOpen
            ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border'
            : 'bg-gradient-to-b from-black/70 to-transparent'
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#f31260] flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block">
                Nghiền <span className="text-[#f31260]">Phim</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  'px-3 py-2 rounded text-sm font-medium transition-colors',
                  pathname === '/' ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
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
                    'flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                    pathname.startsWith('/danh-sach') ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Danh Sách
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'danh-sach' && 'rotate-180')} />
                </button>
                {openDropdown === 'danh-sach' && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-xl py-1 z-50"
                    onMouseEnter={() => setOpenDropdown('danh-sach')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {MOVIE_TYPES.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-popover-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Thể Loại dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setOpenDropdown('the-loai')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                    pathname.startsWith('/the-loai') ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Thể Loại
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'the-loai' && 'rotate-180')} />
                </button>
                {openDropdown === 'the-loai' && categories && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-xl py-2 z-50"
                    onMouseEnter={() => setOpenDropdown('the-loai')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div className="grid grid-cols-2 gap-0.5 px-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/the-loai/${cat.slug}`}
                          className="block px-3 py-1.5 text-sm text-popover-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
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
                    'flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                    pathname.startsWith('/quoc-gia') ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Quốc Gia
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'quoc-gia' && 'rotate-180')} />
                </button>
                {openDropdown === 'quoc-gia' && countries && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-xl py-2 z-50"
                    onMouseEnter={() => setOpenDropdown('quoc-gia')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div className="grid grid-cols-2 gap-0.5 px-2">
                      {countries.map((country) => (
                        <Link
                          key={country.id}
                          href={`/quoc-gia/${country.slug}`}
                          className="block px-3 py-1.5 text-sm text-popover-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
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
                    'flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                    pathname === '/api-doc' || pathname === '/yeu-thich' || pathname === '/lich-su' || pathname === '/de-xuat'
                      ? 'text-[#f31260]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Khám Phá
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === 'kham-pha' && 'rotate-180')} />
                </button>
                {openDropdown === 'kham-pha' && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-xl py-1 z-50"
                    onMouseEnter={() => setOpenDropdown('kham-pha')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {EXPLORE_LINKS.map((item) => {
                      const Icon = item.icon
                      const isFav = item.href === '/yeu-thich'
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center justify-between px-4 py-2 text-sm text-popover-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
                )}
              </div>

              {authUser?.role === 'admin' && (
                <Link
                  href="/quan-tri"
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                    pathname.startsWith('/quan-tri') ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
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
                    className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                      'px-3 py-2 rounded text-sm font-medium transition-colors',
                      pathname.startsWith('/dang-nhap') ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className={cn(
                      'rounded-full border border-[#f31260]/50 bg-[#f31260]/15 px-3 py-1.5 text-sm font-medium transition-colors',
                      pathname.startsWith('/dang-ky') ? 'text-[#ff8db9]' : 'text-[#ff97bf] hover:bg-[#f31260]/25'
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
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
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
