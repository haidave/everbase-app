import { type Event } from '@/db/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all events
export function useEvents() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['events', user?.id],
    queryFn: () => api.events.getAll(),
    enabled: !!user,
  })
}

// Hook for fetching upcoming events (next 30 days by default)
export function useUpcomingEvents(days = 30) {
  const { user } = useAuth()

  // Use a stable query key by using the days parameter instead of dates
  return useQuery({
    queryKey: ['events', 'upcoming', user?.id, days],
    queryFn: () => {
      const today = new Date()
      // Create a date at 00:00 local time
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      // Create an end date at 00:00 local time days in the future
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + days)

      return api.events.getUpcoming(startDate, endDate)
    },
    enabled: !!user,
  })
}

// Hook for creating an event
export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (event: Omit<Event, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      // Convert null to undefined for description
      const { description, ...rest } = event
      return api.events.create({
        ...rest,
        description: description === null ? undefined : description,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming', user?.id] })
    },
  })
}

// Hook for updating an event
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Event> & { id: string }) => api.events.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming', user?.id] })
    },
  })
}

// Hook for deleting an event
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.events.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming', user?.id] })
    },
  })
}
