import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'

import { api } from '@/lib/api'

import { useAuth } from './use-auth'

// Get the current month in YYYY-MM format
const getCurrentMonth = () => format(new Date(), 'yyyy-MM')

// Hook for fetching monthly checklists
export function useMonthlyChecklist() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-checklists', user?.id],
    queryFn: () => api.monthlyChecklist.getAll(),
    enabled: !!user,
  })
}

// Hook for fetching monthly checklist completions for the current month
export function useMonthlyChecklistCompletions() {
  const { user } = useAuth()
  const currentMonth = getCurrentMonth()

  return useQuery({
    queryKey: ['monthly-checklist-completions', user?.id, currentMonth],
    queryFn: () => api.monthlyChecklist.getCompletions(currentMonth),
    enabled: !!user,
    // Refetch on the first day of the month
    refetchOnMount: () => {
      const today = new Date()
      return today.getDate() === 1
    },
  })
}

// Hook for creating a monthly checklist
export function useCreateMonthlyChecklist() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (monthlyChecklist: { name: string; description?: string; active: boolean }) =>
      api.monthlyChecklist.create(monthlyChecklist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-checklists', user?.id] })
    },
  })
}

// Hook for updating a monthly checklist
export function useUpdateMonthlyChecklist() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (monthlyChecklist: { id: string; name: string; description?: string; active?: boolean }) =>
      api.monthlyChecklist.update(monthlyChecklist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-checklists', user?.id] })
    },
  })
}

// Hook for deleting a monthly checklist
export function useDeleteMonthlyChecklist() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.monthlyChecklist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-checklists', user?.id] })
    },
  })
}

// Hook for completing a monthly checklist item
export function useCompleteMonthlyChecklist() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const currentMonth = getCurrentMonth()

  return useMutation({
    mutationFn: (id: string) => api.monthlyChecklist.complete(id, currentMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['monthly-checklist-completions', user?.id, currentMonth],
      })
    },
  })
}

// Hook for uncompleting a monthly checklist item
export function useUncompleteMonthlyChecklist() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const currentMonth = getCurrentMonth()

  return useMutation({
    mutationFn: (id: string) => api.monthlyChecklist.uncomplete(id, currentMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['monthly-checklist-completions', user?.id, currentMonth],
      })
    },
  })
}
