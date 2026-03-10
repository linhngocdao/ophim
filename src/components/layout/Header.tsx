'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Film, Search, BookOpen, Heart } from 'lucide-react'
import { useMovieStore } from '@/store/useMovieStore'
import { useCategories, useCountries } from '@/hooks/useMovies'
import { SearchBar } from '@/components/ui/SearchBar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const MOVIE_TYPES = [
  { label: 'Phim Mới Cập Nhật', href: '/danh-sach/phim-moi-cap-nhat' },
  { label: 'Phim Lẻ', href: '/danh-sach/phim-le' },
  { label: 'Phim Bộ', href: '/danh-sach/phim-bo' },
  { label: 'Hoạt Hình', href: '/danh-sach/hoat-hinh' },
  { label: 'TV Shows', href: '/danh-sach/tv-shows' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const { data: categories } = useCategories()
  const { data: countries } = useCountries()
  const { favorites } = useMovieStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || isMenuOpen
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
              <Link
                href="/api-doc"
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                  pathname === '/api-doc' ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                API
              </Link>

              <Link
                href="/yeu-thich"
                className={cn(
                  'relative flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                  pathname === '/yeu-thich' ? 'text-[#f31260]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Heart className="w-3.5 h-3.5" />
                Yêu Thích
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-4 bg-[#f31260] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {/* Desktop search */}
              {isSearchOpen ? (
                <div className="hidden md:flex items-center gap-2">
                  <SearchBar className="w-64" autoFocus onClose={() => setIsSearchOpen(false)} />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Mobile search button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
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
          {isSearchOpen && (
            <div className="md:hidden pb-3">
              <SearchBar className="w-full" autoFocus onClose={() => setIsSearchOpen(false)} />
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
    </>
  )
}
