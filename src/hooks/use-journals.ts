import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all journals
export function useJournals() {
  const { user } = useAuth()

  // Calculate time until midnight for refetch interval
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const timeUntilMidnight = tomorrow.getTime() - now.getTime()

  return useQuery({
    queryKey: ['journals', user?.id],
    queryFn: () => api.journals.getAll(),
    enabled: !!user,
    // This will automatically refetch at midnight
    refetchInterval: timeUntilMidnight,
    // Only refetch once at midnight, then recalculate the interval
    refetchIntervalInBackground: true,
  })
}

// Hook for fetching a single journal
export function useJournal(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['journals', id, user?.id],
    queryFn: () => api.journals.getById(id),
    enabled: !!user && !!id,
  })
}

// Hook for creating a journal
export function useCreateJournal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (journal: { content: string }) => api.journals.create(journal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals', user?.id] })
    },
  })
}

// Hook for updating a journal
export function useUpdateJournal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => api.journals.update(id, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journals', variables.id, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['journals', user?.id] })
    },
  })
}

// Hook for deleting a journal
export function useDeleteJournal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.journals.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals', user?.id] })
    },
  })
}
