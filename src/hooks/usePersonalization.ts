'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Movie } from '@/types/movie'
import {
  getMyRating,
  getPersonalizedRecommendations,
  saveMyRating,
} from '@/lib/user-api'

export function usePersonalizedRecommendations(limit = 18) {
  return useQuery({
    queryKey: ['personalization', 'recommendations', limit],
    queryFn: () => getPersonalizedRecommendations(limit),
    staleTime: 60 * 1000,
    retry: 1,
  })
}

export function useMyMovieRating(movieId?: string) {
  return useQuery({
    queryKey: ['personalization', 'rating', movieId],
    queryFn: () => getMyRating(movieId as string),
    enabled: Boolean(movieId),
    staleTime: 30 * 1000,
    retry: 1,
  })
}

export function useSaveMovieRating(movieId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { movie: Movie; rating: number; review?: string }) => {
      await saveMyRating(input)
      return input
    },
    onSuccess: (input) => {
      if (!movieId) return
      queryClient.setQueryData(['personalization', 'rating', movieId], {
        rating: input.rating,
        review: input.review?.trim() ?? '',
      })
    },
  })
}
