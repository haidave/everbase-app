import { type Quote } from '@/db/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching quotes
export function useQuotes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['quotes', user?.id],
    queryFn: () => api.quotes.getAll(),
    enabled: !!user,
  })
}

// Hook for getting quote of the day
export function useQuoteOfTheDay() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['quote-of-the-day', user?.id],
    queryFn: () => api.quotes.getQuoteOfTheDay(),
    enabled: !!user,
    // Refetch at midnight
    refetchInterval: () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return tomorrow.getTime() - now.getTime()
    },
  })
}

// Hook for creating a quote
export function useCreateQuote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (quote: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => api.quotes.create(quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', user?.id] })
    },
  })
}

// Hook for updating a quote
export function useUpdateQuote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (quote: Pick<Quote, 'id' | 'quote' | 'author'>) => api.quotes.update(quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['quote-of-the-day', user?.id] })
    },
  })
}

// Hook for deleting a quote
export function useDeleteQuote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.quotes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['quote-of-the-day', user?.id] })
    },
  })
}
