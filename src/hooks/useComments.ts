'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Movie } from '@/types/movie'
import {
  createMovieComment,
  getMovieComments,
  replyMovieComment,
  toggleCommentLike,
  type MovieComment,
} from '@/lib/user-api'

export function useMovieComments(movieId?: string, page = 1, limit = 8) {
  return useQuery({
    queryKey: ['movie-comments', movieId, page, limit],
    queryFn: () => getMovieComments(movieId as string, page, limit),
    enabled: Boolean(movieId),
    staleTime: 15 * 1000,
  })
}

export function useCommentReplies(movieId?: string, parentId?: string, page = 1, limit = 5) {
  return useQuery({
    queryKey: ['movie-comments-replies', movieId, parentId, page, limit],
    queryFn: () => getMovieComments(movieId as string, page, limit, parentId as string),
    enabled: Boolean(movieId && parentId),
    staleTime: 10 * 1000,
  })
}

export function useCreateComment(movieId?: string, page = 1, limit = 8) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { movie: Movie; content: string }) => createMovieComment(payload),
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ['movie-comments', movieId, page, limit],
        (prev: { data: MovieComment[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number } } | undefined) => {
          if (!prev) return prev
          const data = [newComment, ...prev.data].slice(0, limit)
          const totalItems = prev.pagination.totalItems + 1
          return {
            data,
            pagination: {
              ...prev.pagination,
              totalItems,
              totalPages: Math.max(1, Math.ceil(totalItems / prev.pagination.limit)),
            },
          }
        }
      )
    },
  })
}

export function useReplyComment(movieId?: string, parentId?: string, page = 1, limit = 5) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { movie: Movie; commentId: string; content: string }) => replyMovieComment(payload),
    onSuccess: (newReply) => {
      queryClient.setQueryData(
        ['movie-comments-replies', movieId, parentId, page, limit],
        (prev: { data: MovieComment[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number } } | undefined) => {
          if (!prev) return prev
          const data = [newReply, ...prev.data].slice(0, limit)
          const totalItems = prev.pagination.totalItems + 1
          return {
            data,
            pagination: {
              ...prev.pagination,
              totalItems,
              totalPages: Math.max(1, Math.ceil(totalItems / prev.pagination.limit)),
            },
          }
        }
      )
      queryClient.invalidateQueries({ queryKey: ['movie-comments', movieId] })
    },
  })
}

export function useToggleCommentLike(movieId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: string) => {
      const result = await toggleCommentLike(commentId)
      return { commentId, liked: result.liked }
    },
    onSuccess: ({ commentId, liked }) => {
      const updateList = (list: MovieComment[]) =>
        list.map((item) =>
          item.commentId === commentId
            ? {
              ...item,
              likedByMe: liked,
              likeCount: Math.max(0, item.likeCount + (liked ? 1 : -1)),
            }
            : item
        )

      queryClient.setQueriesData(
        { queryKey: ['movie-comments', movieId] },
        (prev: { data: MovieComment[]; pagination: unknown } | undefined) =>
          prev ? { ...prev, data: updateList(prev.data) } : prev
      )

      queryClient.setQueriesData(
        { queryKey: ['movie-comments-replies', movieId] },
        (prev: { data: MovieComment[]; pagination: unknown } | undefined) =>
          prev ? { ...prev, data: updateList(prev.data) } : prev
      )
    },
  })
}
