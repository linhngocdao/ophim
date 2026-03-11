'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import type { Movie } from '@/types/movie'
import {
  useCommentReplies,
  useCreateComment,
  useMovieComments,
  useReplyComment,
  useToggleCommentLike,
} from '@/hooks/useComments'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'

function formatTime(value: string) {
  return new Date(value).toLocaleString('vi-VN')
}

function ReplyBlock({ movie, commentId, count }: { movie: Movie; commentId: string; count: number }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [text, setText] = useState('')
  const { data, isLoading } = useCommentReplies(movie._id, commentId, page, 5)
  const replyMutation = useReplyComment(movie._id, commentId, page, 5)
  const likeMutation = useToggleCommentLike(movie._id)

  const submitReply = async () => {
    const content = text.trim()
    if (content.length < 2 || replyMutation.isPending) return
    try {
      await replyMutation.mutateAsync({ movie, commentId, content })
      setText('')
      setOpen(true)
    } catch {
      // noop
    }
  }

  return (
    <div className="ml-2 mt-3 border-l border-white/10 pl-3">
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="text-xs font-medium text-[#f31260] hover:underline"
        >
          {open ? 'Ẩn phản hồi' : `Xem phản hồi (${count})`}
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết phản hồi..."
          className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#f31260]/60"
        />
        <button
          onClick={() => void submitReply()}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#f31260] px-3 text-white disabled:opacity-60"
          disabled={text.trim().length < 2 || replyMutation.isPending}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-2">
          {isLoading && <p className="text-xs text-zinc-500">Đang tải phản hồi...</p>}
          {data?.data?.map((reply) => (
            <div key={reply.commentId} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{reply.author.name}</span>
                <span className="text-[11px] text-zinc-500">{formatTime(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-200">{reply.content}</p>
              <div className="mt-2">
                <button
                  onClick={() => likeMutation.mutate(reply.commentId)}
                  className={cn(
                    'inline-flex items-center gap-1 text-xs transition-colors',
                    reply.likedByMe ? 'text-[#f31260]' : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <Heart className={cn('h-3 w-3', reply.likedByMe && 'fill-[#f31260]')} />
                  {reply.likeCount}
                </button>
              </div>
            </div>
          ))}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
              className="justify-start"
            />
          )}
        </div>
      )}
    </div>
  )
}

export function MovieDiscussion({ movie }: { movie: Movie }) {
  const [page, setPage] = useState(1)
  const [text, setText] = useState('')
  const { data, isLoading } = useMovieComments(movie._id, page, 8)
  const createMutation = useCreateComment(movie._id, page, 8)
  const likeMutation = useToggleCommentLike(movie._id)

  const submitComment = async () => {
    const content = text.trim()
    if (content.length < 2 || createMutation.isPending) return
    try {
      await createMutation.mutateAsync({ movie, content })
      setText('')
    } catch {
      // noop
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Đánh giá & Bình luận</h2>

      <div className="mb-5 flex items-start gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Chia sẻ cảm nhận sau khi xem phim..."
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#f31260]/60"
        />
        <button
          onClick={() => void submitComment()}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#f31260] px-3 text-white disabled:opacity-60"
          disabled={text.trim().length < 2 || createMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Đang tải bình luận...</p>}

      <div className="space-y-3">
        {data?.data?.map((comment) => (
          <article key={comment.commentId} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{comment.author.name}</span>
              <span className="text-xs text-zinc-500">{formatTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-200">{comment.content}</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => likeMutation.mutate(comment.commentId)}
                className={cn(
                  'inline-flex items-center gap-1 text-xs transition-colors',
                  comment.likedByMe ? 'text-[#f31260]' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <Heart className={cn('h-3.5 w-3.5', comment.likedByMe && 'fill-[#f31260]')} />
                {comment.likeCount}
              </button>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                <MessageCircle className="h-3.5 w-3.5" />
                {comment.replyCount} phản hồi
              </span>
            </div>
            <ReplyBlock movie={movie} commentId={comment.commentId} count={comment.replyCount} />
          </article>
        ))}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-5">
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
