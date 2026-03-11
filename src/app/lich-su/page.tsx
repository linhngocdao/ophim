'use client'

import Link from 'next/link'
import { History, Trash2, Play, Clock } from 'lucide-react'
import { useMovieStore } from '@/store/useMovieStore'
import { clearWatchHistory } from '@/lib/user-api'

export default function HistoryPage() {
  const { watchHistory, clearHistory, setWatchHistory } = useMovieStore()

  const removeItem = async (movieId: string) => {
    const next = watchHistory.filter((item) => item.movie._id !== movieId)
    setWatchHistory(next)
    await clearWatchHistory(movieId).catch(() => undefined)
  }

  const removeAll = () => {
    clearHistory()
  }

  return (
    <div className="min-h-screen max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#f31260]" />
          <h1 className="text-2xl font-bold">Lịch sử xem</h1>
          <span className="text-sm text-muted-foreground">({watchHistory.length})</span>
        </div>
        {watchHistory.length > 0 && (
          <button
            onClick={removeAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-border hover:border-destructive/50 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {watchHistory.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-lg font-semibold">Bạn chưa có lịch sử xem</p>
          <p className="text-muted-foreground mt-1">Xem một tập phim để lưu và quay lại nhanh hơn.</p>
          <Link
            href="/"
            className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-[#f31260] hover:bg-[#e01055] text-white transition-colors"
          >
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchHistory.map((item) => (
            <div
              key={`${item.movie._id}-${item.episodeSlug}`}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold line-clamp-1">{item.movie.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.movie.origin_name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-secondary border border-border">
                    Tập {item.episodeName}
                  </span>
                  {typeof item.watchProgress === 'number' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#f31260]/15 text-[#f31260] border border-[#f31260]/30">
                      {item.watchProgress}% đã xem
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(item.watchedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/phim/${item.movie.slug}/xem/${item.episodeSlug}`}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#f31260] hover:bg-[#e01055] text-white transition-colors"
                  title="Xem tiếp"
                >
                  <Play className="w-4 h-4 fill-white" />
                </Link>
                <button
                  onClick={() => void removeItem(item.movie._id)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-secondary border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                  title="Xóa khỏi lịch sử"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
