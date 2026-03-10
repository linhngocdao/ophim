'use client'

import { useEffect, useState } from 'react'
import { X, Film, Facebook, Send, Youtube, Star, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'ophim_welcomed_v1'

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://www.facebook.com/linhdaongoc22', // ← thay link Facebook của bạn
    label: 'Theo dõi Facebook',
    color: 'bg-[#1877F2] hover:bg-[#166fe5]',
  },
  {
    name: 'Telegram',
    icon: Send,
    href: 'https://t.me/ling30th5', // ← thay link Telegram của bạn
    label: 'Tham gia Telegram',
    color: 'bg-[#229ED9] hover:bg-[#1a8bbf]',
  }
]

const FEATURES = [
  { icon: Zap, text: 'Cập nhật phim mới mỗi ngày' },
  { icon: Shield, text: 'Hoàn toàn miễn phí, không quảng cáo' },
  { icon: Star, text: 'Hơn 34.000 bộ phim chất lượng HD' },
]

export function WelcomeModal() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      // Delay nhỏ để trang load xong mới hiện
      const t = setTimeout(() => {
        setOpen(true)
        requestAnimationFrame(() => setVisible(true))
      }, 800)
      return () => clearTimeout(t)
    }
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(() => {
      setOpen(false)
      localStorage.setItem(STORAGE_KEY, '1')
    }, 300)
  }

  if (!open) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300',
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
      >
        {/* Decorative top bar */}

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Logo + title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f31260] flex items-center justify-center shadow-lg shadow-[#f31260]/30 mb-4">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">
              Chào mừng đến <span className="text-[#f31260]">Nghiền Phim</span>!
            </h2>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Kho phim online khổng lồ, miễn phí 100%, cập nhật nhanh nhất Việt Nam.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-6">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-secondary/60 rounded-xl px-4 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#f31260]/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#f31260]" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Social section */}
          <div className="mb-6">
            <p className="text-center text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
              Theo dõi để không bỏ lỡ phim mới
            </p>
            <div className="flex flex-col gap-2">
              {SOCIAL_LINKS.map(({ name, icon: Icon, href, label, color }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-3 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 active:scale-95',
                    color
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                  <span className="ml-auto text-white/70 text-xs">→</span>
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={close}
            className="w-full bg-[#f31260] hover:bg-[#e01055] active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#f31260]/25 text-sm"
          >
            Bắt đầu xem phim ngay 🎬
          </button>

          <p className="text-center text-xs text-muted-foreground/60 mt-3">
            Nhấn bất kỳ đâu bên ngoài để đóng
          </p>
        </div>
      </div>
    </div>
  )
}
