'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, Zap, BookOpen, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

interface Param {
  name: string
  type: string
  required: boolean
  description: string
  options?: string[]
}

interface Endpoint {
  id: string
  method: 'GET'
  path: string
  summary: string
  description: string
  params: Param[]
  response: object
  exampleUrl: string
}

const ENDPOINTS: Endpoint[] = [
  {
    id: 'list-movies',
    method: 'GET',
    path: '/api/movies',
    summary: 'Danh sách phim',
    description: 'Lấy danh sách phim theo loại (phim mới cập nhật, phim lẻ, phim bộ, hoạt hình...).',
    params: [
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Loại danh sách phim',
        options: ['phim-moi-cap-nhat', 'phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows'],
      },
      { name: 'page', type: 'number', required: false, description: 'Số trang (mặc định: 1)' },
    ],
    response: {
      status: true,
      data: {
        items: [
          {
            _id: 'abc123',
            name: 'Tên phim',
            slug: 'ten-phim',
            origin_name: 'Movie Name',
            thumb_url: 'https://img.ophim.live/uploads/movies/thumb.jpg',
            poster_url: 'https://img.ophim.live/uploads/movies/poster.jpg',
            year: 2024,
            quality: 'HD',
            lang: 'Vietsub',
            episode_current: 'Hoàn Tất (12/12)',
            type: 'series',
          },
        ],
        params: {
          pagination: { totalItems: 34000, totalItemsPerPage: 24, currentPage: 1, totalPages: 1417 },
        },
      },
    },
    exampleUrl: '/api/movies?type=phim-moi-cap-nhat&page=1',
  },
  {
    id: 'movie-detail',
    method: 'GET',
    path: '/api/movies/:slug',
    summary: 'Chi tiết phim',
    description: 'Lấy thông tin chi tiết của một bộ phim bao gồm danh sách tập phim và server stream.',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
        description: 'Slug của phim (lấy từ trường slug trong danh sách)',
      },
    ],
    response: {
      status: true,
      data: {
        item: {
          _id: 'abc123',
          name: 'Tên phim',
          slug: 'ten-phim',
          origin_name: 'Movie Name',
          content: 'Nội dung mô tả phim...',
          type: 'series',
          status: 'completed',
          thumb_url: 'https://img.ophim.live/...',
          poster_url: 'https://img.ophim.live/...',
          trailer_url: 'https://www.youtube.com/watch?v=...',
          year: 2024,
          quality: 'HD',
          lang: 'Vietsub',
          episode_current: 'Hoàn Tất (12/12)',
          episode_total: '12 Tập',
          category: [{ id: '1', name: 'Hành Động', slug: 'hanh-dong' }],
          country: [{ id: '1', name: 'Hàn Quốc', slug: 'han-quoc' }],
          episodes: [
            {
              server_name: 'Server #1',
              server_data: [
                { name: '1', slug: '1', link_embed: 'https://player.ophim.live/...', link_m3u8: '' },
              ],
            },
          ],
        },
        APP_DOMAIN_CDN_IMAGE: 'https://img.ophim.live',
      },
    },
    exampleUrl: '/api/movies/tham-tu-lung-danh-conan-co-dau-mau-do',
  },
  {
    id: 'search',
    method: 'GET',
    path: '/api/search',
    summary: 'Tìm kiếm phim',
    description: 'Tìm kiếm phim theo từ khóa. Trả về danh sách phim khớp với tên phim hoặc tên gốc.',
    params: [
      { name: 'keyword', type: 'string', required: true, description: 'Từ khóa tìm kiếm' },
      { name: 'page', type: 'number', required: false, description: 'Số trang (mặc định: 1)' },
    ],
    response: {
      status: true,
      data: {
        items: [{ _id: 'xyz', name: 'Naruto', slug: 'naruto', thumb_url: '...' }],
        params: { pagination: { totalItems: 5, currentPage: 1, totalPages: 1 } },
      },
    },
    exampleUrl: '/api/search?keyword=naruto&page=1',
  },
  {
    id: 'categories',
    method: 'GET',
    path: '/api/categories',
    summary: 'Danh sách thể loại',
    description: 'Lấy toàn bộ danh sách thể loại phim.',
    params: [],
    response: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '2', name: 'Tình Cảm', slug: 'tinh-cam' },
      { id: '3', name: 'Hài Hước', slug: 'hai-huoc' },
    ],
    exampleUrl: '/api/categories',
  },
  {
    id: 'category-movies',
    method: 'GET',
    path: '/api/categories/movies',
    summary: 'Phim theo thể loại',
    description: 'Lấy danh sách phim theo thể loại (slug).',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
        description: 'Slug thể loại (lấy từ /api/categories)',
        options: ['hanh-dong', 'tinh-cam', 'hai-huoc', 'kinh-di', 'vien-tuong'],
      },
      { name: 'page', type: 'number', required: false, description: 'Số trang (mặc định: 1)' },
    ],
    response: {
      status: true,
      data: {
        items: [{ _id: 'abc', name: 'Tên phim', slug: 'ten-phim' }],
        params: { pagination: { currentPage: 1, totalPages: 50 } },
      },
    },
    exampleUrl: '/api/categories/movies?slug=hanh-dong&page=1',
  },
  {
    id: 'countries',
    method: 'GET',
    path: '/api/countries',
    summary: 'Danh sách quốc gia',
    description: 'Lấy toàn bộ danh sách quốc gia sản xuất phim.',
    params: [],
    response: [
      { id: '1', name: 'Hàn Quốc', slug: 'han-quoc' },
      { id: '2', name: 'Trung Quốc', slug: 'trung-quoc' },
      { id: '3', name: 'Mỹ', slug: 'au-my' },
    ],
    exampleUrl: '/api/countries',
  },
  {
    id: 'country-movies',
    method: 'GET',
    path: '/api/countries/movies',
    summary: 'Phim theo quốc gia',
    description: 'Lấy danh sách phim theo quốc gia sản xuất.',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
        description: 'Slug quốc gia (lấy từ /api/countries)',
        options: ['han-quoc', 'trung-quoc', 'au-my', 'nhat-ban', 'thai-lan'],
      },
      { name: 'page', type: 'number', required: false, description: 'Số trang (mặc định: 1)' },
    ],
    response: {
      status: true,
      data: {
        items: [{ _id: 'abc', name: 'Tên phim', slug: 'ten-phim' }],
        params: { pagination: { currentPage: 1, totalPages: 100 } },
      },
    },
    exampleUrl: '/api/countries/movies?slug=han-quoc&page=1',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white/90"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false)
  const [tryResult, setTryResult] = useState<string | null>(null)
  const [trying, setTrying] = useState(false)

  const tryIt = async () => {
    setTrying(true)
    setTryResult(null)
    try {
      const res = await fetch(endpoint.exampleUrl)
      const data = await res.json()
      setTryResult(JSON.stringify(data, null, 2))
    } catch {
      setTryResult('{"error": "Request failed"}')
    } finally {
      setTrying(false)
    }
  }

  const fullUrl = `${BASE_URL}${endpoint.exampleUrl}`

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/40 transition-colors"
      >
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
          GET
        </span>
        <code className="text-sm font-mono text-foreground flex-1 truncate">{endpoint.path}</code>
        <span className="text-sm text-muted-foreground hidden sm:block flex-shrink-0">{endpoint.summary}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-5">
          <p className="text-muted-foreground text-sm">{endpoint.description}</p>

          {endpoint.params.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Tham số</h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs">Tên</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs">Loại</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs">Bắt buộc</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs hidden md:table-cell">
                        Mô tả / Giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((p) => (
                      <tr key={p.name} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <code className="text-[#f31260] font-mono text-xs font-semibold">{p.name}</code>
                        </td>
                        <td className="px-4 py-3 text-xs text-blue-400 font-mono">{p.type}</td>
                        <td className="px-4 py-3">
                          {p.required ? (
                            <span className="text-xs bg-[#f31260]/15 text-[#f31260] px-2 py-0.5 rounded-full border border-[#f31260]/20">
                              Bắt buộc
                            </span>
                          ) : (
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                              Tuỳ chọn
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          <div>{p.description}</div>
                          {p.options && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {p.options.map((o) => (
                                <code
                                  key={o}
                                  className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-foreground/70"
                                >
                                  {o}
                                </code>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-2">Ví dụ</h4>
            <div className="flex items-center gap-2 bg-[#0d1117] rounded-lg px-4 py-3 border border-white/10">
              <span className="text-green-400 text-xs font-mono font-bold flex-shrink-0">GET</span>
              <code className="text-xs font-mono text-white/80 flex-1 truncate">{fullUrl}</code>
              <CopyButton text={fullUrl} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Response mẫu</h4>
            <div className="bg-[#0d1117] rounded-lg border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-xs text-white/40 font-mono">JSON</span>
                <CopyButton text={JSON.stringify(endpoint.response, null, 2)} />
              </div>
              <pre className="text-xs text-white/70 p-4 overflow-x-auto max-h-60 leading-relaxed">
                {JSON.stringify(endpoint.response, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <h4 className="text-sm font-semibold">Thử ngay</h4>
              <button
                onClick={tryIt}
                disabled={trying}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f31260] hover:bg-[#e01055] disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                <Zap className="w-3 h-3" />
                {trying ? 'Đang gọi...' : 'Send Request'}
              </button>
            </div>
            {tryResult && (
              <div className="bg-[#0d1117] rounded-lg border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                  <span className="text-xs text-green-400 font-mono">200 OK</span>
                  <CopyButton text={tryResult} />
                </div>
                <pre className="text-xs text-white/70 p-4 overflow-x-auto max-h-80 leading-relaxed">
                  {tryResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ApiDocClient() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#f31260]/10 via-background to-background border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#f31260] flex items-center justify-center shadow-lg shadow-[#f31260]/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#f31260] uppercase tracking-wider">
              API Documentation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Ophim Public API</h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Tích hợp kho phim hơn 34.000 bộ vào ứng dụng của bạn. RESTful API, miễn phí, không cần
            xác thực.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
              <Globe className="w-4 h-4 text-[#f31260]" />
              <span className="font-mono text-xs text-foreground/80">Base URL:</span>
              <code className="font-mono text-xs text-foreground font-semibold">{BASE_URL || '{your-domain}'}</code>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">API đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-20 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                Endpoints
              </p>
              {ENDPOINTS.map((ep) => (
                <a
                  key={ep.id}
                  href={`#${ep.id}`}
                  onClick={() => setActiveSection(ep.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeSection === ep.id
                      ? 'bg-[#f31260]/15 text-[#f31260]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <span className="text-[10px] font-bold text-green-400 w-8 flex-shrink-0">GET</span>
                  <span className="truncate">{ep.summary}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Quick start */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f31260]" />
                Bắt đầu nhanh
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Tất cả endpoints đều là HTTP GET, không cần API key. Thay{' '}
                <code className="text-[#f31260] text-xs bg-[#f31260]/10 px-1.5 py-0.5 rounded">
                  {'{BASE_URL}'}
                </code>{' '}
                bằng domain của website.
              </p>
              <div className="bg-[#0d1117] rounded-lg border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                  <span className="text-xs text-white/40">JavaScript / fetch</span>
                  <CopyButton
                    text={`const res = await fetch('${BASE_URL}/api/movies?type=phim-moi-cap-nhat&page=1')\nconst data = await res.json()\nconsole.log(data.data.items) // mảng phim`}
                  />
                </div>
                <pre className="text-xs text-white/70 p-4 overflow-x-auto leading-relaxed">{`const res = await fetch('${BASE_URL || '{BASE_URL}'}/api/movies?type=phim-moi-cap-nhat&page=1')
const data = await res.json()
console.log(data.data.items) // mảng phim`}</pre>
              </div>
            </div>

            {/* Endpoints */}
            {ENDPOINTS.map((ep) => (
              <div key={ep.id} id={ep.id}>
                <EndpointCard endpoint={ep} />
              </div>
            ))}

            {/* Notes */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-sm">Lưu ý quan trọng</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-[#f31260] flex-shrink-0">•</span>
                  Ảnh phim: thêm tiền tố{' '}
                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">
                    https://img.ophim.live
                  </code>{' '}
                  vào{' '}
                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">
                    thumb_url
                  </code>{' '}
                  /{' '}
                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">
                    poster_url
                  </code>{' '}
                  để hiển thị đầy đủ.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#f31260] flex-shrink-0">•</span>
                  Tập phim hợp lệ: chỉ những tập có{' '}
                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">
                    link_embed
                  </code>{' '}
                  khác rỗng mới có thể stream.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#f31260] flex-shrink-0">•</span>
                  Cache: danh sách phim 5 phút, chi tiết phim 5 phút, thể loại / quốc gia 1 giờ.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#f31260] flex-shrink-0">•</span>
                  Rate limit: sử dụng hợp lý để tránh bị chặn. Không dùng cho mục đích thương mại.
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
