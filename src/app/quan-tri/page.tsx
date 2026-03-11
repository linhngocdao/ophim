'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Film, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users, DatabaseZap, Sparkles } from 'lucide-react'
import type { Movie } from '@/types/movie'
import { MovieContentEditor } from '@/components/admin/MovieContentEditor'

type TaxonomyItem = { id: string; name: string; slug: string }
type AdminTab = 'overview' | 'library' | 'editor'
type SyncSummary = {
  fetchedListPages: number
  fetchedDetails: number
  upsertedMovies: number
  categories: number
  countries: number
}

type MovieFormState = {
  _id?: string
  name: string
  slug: string
  origin_name: string
  type: Movie['type']
  year: number
  quality: string
  lang: string
  time: string
  thumb_url: string
  poster_url: string
  trailer_url: string
  actor: string
  director: string
  categorySlugs: string[]
  countrySlugs: string[]
  content: string
}

const EMPTY_FORM: MovieFormState = {
  name: '',
  slug: '',
  origin_name: '',
  type: 'movie',
  year: new Date().getFullYear(),
  quality: '',
  lang: '',
  time: '',
  thumb_url: '',
  poster_url: '',
  trailer_url: '',
  actor: '',
  director: '',
  categorySlugs: [],
  countrySlugs: [],
  content: '',
}

function toFormState(movie?: Movie): MovieFormState {
  if (!movie) return { ...EMPTY_FORM }
  return {
    _id: movie._id,
    name: movie.name || '',
    slug: movie.slug || '',
    origin_name: movie.origin_name || '',
    type: movie.type || 'movie',
    year: movie.year || new Date().getFullYear(),
    quality: movie.quality || '',
    lang: movie.lang || '',
    time: movie.time || '',
    thumb_url: movie.thumb_url || '',
    poster_url: movie.poster_url || '',
    trailer_url: movie.trailer_url || '',
    actor: (movie.actor || []).join(', '),
    director: (movie.director || []).join(', '),
    categorySlugs: (movie.category || []).map((item) => item.slug),
    countrySlugs: (movie.country || []).map((item) => item.slug),
    content: movie.content || '',
  }
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<MovieFormState>({ ...EMPTY_FORM })
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [countries, setCountries] = useState<TaxonomyItem[]>([])
  const [syncPages, setSyncPages] = useState(8)
  const [syncDetails, setSyncDetails] = useState(600)
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null)
  const [stats, setStats] = useState<{
    totalUsers?: number
    newUsersLast30Days?: number
    totalMovies?: number
    totalViews?: number
    activeWatchersLast7Days?: number
  }>({})
  const [message, setMessage] = useState<string>('')

  const selectedMovie = useMemo(
    () => movies.find((item) => item._id === selectedId),
    [movies, selectedId]
  )

  const fetchInitial = async () => {
    setLoading(true)
    try {
      const [taxRes, statRes, movieRes] = await Promise.all([
        fetch('/api/admin/taxonomies'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/movies?limit=30'),
      ])

      if (taxRes.ok) {
        const taxJson = await taxRes.json()
        setCategories(taxJson.categories || [])
        setCountries(taxJson.countries || [])
      }

      if (statRes.ok) {
        const statJson = await statRes.json()
        setStats(statJson || {})
      }

      if (movieRes.ok) {
        const movieJson = await movieRes.json()
        const items = (movieJson.data || []) as Movie[]
        setMovies(items)
      }
    } finally {
      setLoading(false)
    }
  }

  const searchMovies = async () => {
    const params = new URLSearchParams({ limit: '30' })
    if (keyword.trim()) params.set('keyword', keyword.trim())
    const res = await fetch(`/api/admin/movies?${params.toString()}`)
    if (!res.ok) return
    const json = await res.json()
    setMovies(json.data || [])
  }

  useEffect(() => {
    void fetchInitial()
  }, [])

  useEffect(() => {
    if (!selectedMovie) return
    setForm(toFormState(selectedMovie))
  }, [selectedMovie])

  const toggleSlug = (field: 'categorySlugs' | 'countrySlugs', slug: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(slug)
        ? prev[field].filter((item) => item !== slug)
        : [...prev[field], slug],
    }))
  }

  const buildPayload = (): Partial<Movie> => {
    const selectedCategories = categories
      .filter((item) => form.categorySlugs.includes(item.slug))
      .map((item) => ({ id: item.id, name: item.name, slug: item.slug }))
    const selectedCountries = countries
      .filter((item) => form.countrySlugs.includes(item.slug))
      .map((item) => ({ id: item.id, name: item.name, slug: item.slug }))

    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      origin_name: form.origin_name.trim() || form.name.trim(),
      type: form.type,
      year: Number(form.year) || new Date().getFullYear(),
      quality: form.quality.trim(),
      lang: form.lang.trim(),
      time: form.time.trim(),
      thumb_url: form.thumb_url.trim(),
      poster_url: form.poster_url.trim(),
      trailer_url: form.trailer_url.trim(),
      actor: form.actor.split(',').map((item) => item.trim()).filter(Boolean),
      director: form.director.split(',').map((item) => item.trim()).filter(Boolean),
      category: selectedCategories,
      country: selectedCountries,
      content: form.content || '',
      episode_current: '',
      episode_total: '',
      status: '',
      episodes: [],
      tmdb: { type: '', id: '' },
      imdb: {},
      alternative_names: [],
    }
  }

  const saveMovie = async () => {
    setSaving(true)
    setMessage('')
    try {
      const payload = buildPayload()
      const isEditing = Boolean(form._id)
      const res = await fetch(isEditing ? `/api/admin/movies/${form._id}` : '/api/admin/movies', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(json?.error || 'Không thể lưu phim')
        return
      }
      setMessage(isEditing ? 'Cập nhật phim thành công' : 'Tạo phim thành công')
      await searchMovies()
      if (!isEditing) setForm({ ...EMPTY_FORM })
    } finally {
      setSaving(false)
    }
  }

  const runSync = async () => {
    setSyncing(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxPagesPerType: Number(syncPages) || 8,
          maxDetailFetch: Number(syncDetails) || 600,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(json?.error || 'Không thể đồng bộ dữ liệu')
        return
      }
      setSyncSummary(json.summary || null)
      setMessage('Đồng bộ dữ liệu phim thành công')
      await fetchInitial()
      await searchMovies()
    } finally {
      setSyncing(false)
    }
  }

  const statCards = [
    {
      key: 'users',
      label: 'Tổng người dùng',
      value: stats.totalUsers || 0,
      icon: Users,
    },
    {
      key: 'newUsers',
      label: 'Người dùng mới 30 ngày',
      value: stats.newUsersLast30Days || 0,
      icon: Sparkles,
    },
    {
      key: 'movies',
      label: 'Tổng phim',
      value: stats.totalMovies || 0,
      icon: Film,
    },
    {
      key: 'views',
      label: 'Tổng lượt xem',
      value: stats.totalViews || 0,
      icon: BarChart3,
    },
  ] as const

  const deleteMovie = async () => {
    if (!form._id) return
    if (!window.confirm('Bạn chắc chắn muốn xóa phim này?')) return
    const res = await fetch(`/api/admin/movies/${form._id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(json?.error || 'Không thể xóa phim')
      return
    }
    setMessage('Đã xóa phim')
    setSelectedId(null)
    setForm({ ...EMPTY_FORM })
    await searchMovies()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-6">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <ShieldCheck className="h-6 w-6 text-[#f31260]" />
            Quản trị hệ thống
          </h1>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <button
              onClick={() => void runSync()}
              disabled={syncing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#f31260]/40 bg-[#f31260]/15 px-4 py-2 text-sm text-[#ff90bb] disabled:opacity-60 sm:flex-none"
            >
              <DatabaseZap className={`h-4 w-4 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ phim'}
            </button>
            <button
              onClick={() => void fetchInitial()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((item) => (
            <div key={item.key} className="rounded-xl border border-white/10 bg-[#141421] p-4">
              <p className="text-xs text-zinc-400">{item.label}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-xl font-bold text-white">
                <item.icon className="h-4 w-4 text-[#f31260]" />
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#12121a] p-4">
          <p className="text-sm font-semibold text-white">Đồng bộ dữ liệu từ bên thứ 3</p>
          <p className="mt-1 text-xs text-zinc-400">
            Thiết lập giới hạn crawl để lấy phim mới nhất. Dùng mức thấp cho đồng bộ nhanh, mức cao cho đồng bộ sâu.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-xs text-zinc-400">
              Số trang / loại phim
              <input
                type="number"
                min={1}
                value={syncPages}
                onChange={(e) => setSyncPages(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
              />
            </label>
            <label className="text-xs text-zinc-400">
              Số phim chi tiết tối đa
              <input
                type="number"
                min={1}
                value={syncDetails}
                onChange={(e) => setSyncDetails(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={() => void runSync()}
                disabled={syncing}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#f31260] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                <DatabaseZap className="h-4 w-4" />
                {syncing ? 'Đang chạy sync...' : 'Chạy đồng bộ ngay'}
              </button>
            </div>
          </div>
          {syncSummary && (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-zinc-300 sm:grid-cols-5">
              <p>List pages: {syncSummary.fetchedListPages}</p>
              <p>Details: {syncSummary.fetchedDetails}</p>
              <p>Upsert: {syncSummary.upsertedMovies}</p>
              <p>Thể loại: {syncSummary.categories}</p>
              <p>Quốc gia: {syncSummary.countries}</p>
            </div>
          )}
        </div>

        <div className="sticky top-[72px] z-10 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-[#0f0f16]/95 p-2 backdrop-blur lg:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-lg px-2 py-2 text-xs font-medium ${activeTab === 'overview' ? 'bg-[#f31260]/20 text-[#ff93be]' : 'text-zinc-300'}`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`rounded-lg px-2 py-2 text-xs font-medium ${activeTab === 'library' ? 'bg-[#f31260]/20 text-[#ff93be]' : 'text-zinc-300'}`}
          >
            Danh sách phim
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`rounded-lg px-2 py-2 text-xs font-medium ${activeTab === 'editor' ? 'bg-[#f31260]/20 text-[#ff93be]' : 'text-zinc-300'}`}
          >
            Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
          <aside className={`rounded-xl border border-white/10 bg-[#13131c] p-4 ${activeTab === 'library' || activeTab === 'overview' ? 'block' : 'hidden lg:block'}`}>
            <div className="mb-3 flex gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm phim theo tên..."
                className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#f31260]/60"
              />
              <button
                onClick={() => void searchMovies()}
                className="rounded-lg bg-[#f31260] px-3 text-sm font-medium text-white"
              >
                Tìm
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedId(null)
                setForm({ ...EMPTY_FORM })
                setActiveTab('editor')
              }}
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#f31260]/40 bg-[#f31260]/10 px-3 py-2 text-sm font-medium text-[#ff8bb8]"
            >
              <Plus className="h-4 w-4" />
              Tạo phim mới
            </button>

            <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {loading && <p className="text-sm text-zinc-500">Đang tải danh sách phim...</p>}
              {movies.map((movie) => (
                <button
                  key={movie._id}
                  onClick={() => {
                    setSelectedId(movie._id)
                    setActiveTab('editor')
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    selectedId === movie._id
                      ? 'border-[#f31260] bg-[#f31260]/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-medium text-white">{movie.name}</p>
                  <p className="line-clamp-1 text-xs text-zinc-400">{movie.slug}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className={`rounded-xl border border-white/10 bg-[#13131c] p-4 ${activeTab === 'editor' || activeTab === 'overview' ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Tên phim</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Tên gốc</label>
                <input value={form.origin_name} onChange={(e) => setForm((p) => ({ ...p, origin_name: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Loại phim</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Movie['type'] }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white">
                  <option value="movie">Phim lẻ</option>
                  <option value="series">Phim bộ</option>
                  <option value="hoathinh">Hoạt hình</option>
                  <option value="tvshows">TV Shows</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Năm</label>
                <input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Chất lượng / Ngôn ngữ</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.quality} onChange={(e) => setForm((p) => ({ ...p, quality: e.target.value }))} placeholder="HD" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
                  <input value={form.lang} onChange={(e) => setForm((p) => ({ ...p, lang: e.target.value }))} placeholder="Vietsub" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">URL ảnh thumb / poster</label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input value={form.thumb_url} onChange={(e) => setForm((p) => ({ ...p, thumb_url: e.target.value }))} placeholder="thumb_url" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
                  <input value={form.poster_url} onChange={(e) => setForm((p) => ({ ...p, poster_url: e.target.value }))} placeholder="poster_url" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">Trailer URL</label>
                <input value={form.trailer_url} onChange={(e) => setForm((p) => ({ ...p, trailer_url: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">Diễn viên (phân tách bằng dấu phẩy)</label>
                <input value={form.actor} onChange={(e) => setForm((p) => ({ ...p, actor: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">Đạo diễn (phân tách bằng dấu phẩy)</label>
                <input value={form.director} onChange={(e) => setForm((p) => ({ ...p, director: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-zinc-400">Thể loại</p>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((item) => (
                      <label key={item.slug} className="inline-flex items-center gap-2 text-xs text-zinc-200">
                        <input
                          type="checkbox"
                          checked={form.categorySlugs.includes(item.slug)}
                          onChange={() => toggleSlug('categorySlugs', item.slug)}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-zinc-400">Quốc gia</p>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {countries.map((item) => (
                      <label key={item.slug} className="inline-flex items-center gap-2 text-xs text-zinc-200">
                        <input
                          type="checkbox"
                          checked={form.countrySlugs.includes(item.slug)}
                          onChange={() => toggleSlug('countrySlugs', item.slug)}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs text-zinc-400">Nội dung phim (Tiptap)</p>
              <MovieContentEditor
                value={form.content}
                onChange={(html) => setForm((p) => ({ ...p, content: html }))}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => void saveMovie()}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f31260] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : form._id ? 'Lưu thay đổi' : 'Tạo phim'}
              </button>
              {form._id && (
                <button
                  onClick={() => void deleteMovie()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa phim
                </button>
              )}
              {message && <p className="text-sm text-zinc-300">{message}</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
