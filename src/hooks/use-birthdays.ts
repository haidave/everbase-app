import { type Birthday } from '@/db/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type NewBirthday } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all birthdays
export function useBirthdays() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['birthdays', user?.id],
    queryFn: () => api.birthdays.getAll(),
    enabled: !!user,
  })
}

// Hook for fetching a single birthday by ID
export function useBirthday(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['birthday', id],
    queryFn: () => (id ? api.birthdays.getById(id) : null),
    enabled: !!user && !!id,
  })
}

// Hook for creating a birthday
export function useCreateBirthday() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (birthday: Omit<NewBirthday, 'userId'>) => api.birthdays.create(birthday),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthdays', user?.id] })
    },
  })
}

// Hook for updating a birthday
export function useUpdateBirthday() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Birthday> & { id: string }) => api.birthdays.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthdays', user?.id] })
    },
  })
}

// Hook for deleting a birthday
export function useDeleteBirthday() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.birthdays.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthdays', user?.id] })
    },
  })
}
