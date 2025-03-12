import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type Habit } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all habits
export function useHabits() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => api.habits.getAll(),
    enabled: !!user,
  })
}

// Hook for fetching a single habit
export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habits', id],
    queryFn: () => api.habits.getById(id),
    enabled: !!id,
  })
}

// Hook for fetching today's habit completions
export function useTodayHabitCompletions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habitCompletions', 'today', user?.id],
    queryFn: () => api.habitCompletions.getTodayCompletions(),
    enabled: !!user,
  })
}

// Hook for completing a habit
export function useCompleteHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (habitId: string) => api.habitCompletions.completeHabit(habitId),
    onSuccess: () => {
      // Invalidate today's completions
      queryClient.invalidateQueries({ queryKey: ['habitCompletions', 'today', user?.id] })
    },
  })
}

// Hook for uncompleting a habit
export function useUncompleteHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (habitId: string) => api.habitCompletions.removeCompletion(habitId),
    onSuccess: () => {
      // Invalidate today's completions
      queryClient.invalidateQueries({ queryKey: ['habitCompletions', 'today', user?.id] })
    },
  })
}

// Hook for creating a habit
export function useCreateHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (habit: { name: string; description?: string; active: boolean }) => api.habits.create(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] })
    },
  })
}

// Hook for updating a habit
export function useUpdateHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (habit: { id: string } & Partial<Pick<Habit, 'name' | 'description' | 'active'>>) =>
      api.habits.update(habit.id, {
        name: habit.name,
        description: habit.description,
        active: habit.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] })
    },
  })
}

// Hook for deleting a habit
export function useDeleteHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.habits.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] })
    },
  })
}

// Hook for fetching habit completion history for a specific period
export function useHabitCompletionHistory(habitId: string, startDate: Date, endDate: Date) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habitCompletions', habitId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => api.habitCompletions.getCompletions(habitId, startDate, endDate),
    enabled: !!user && !!habitId,
  })
}

// Hook for fetching all habit completions for the last year
export function useHabitYearlyStats() {
  const { user } = useAuth()
  const { data: habits } = useHabits()

  // Calculate date range for the last year
  const endDate = new Date()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)

  return useQuery({
    queryKey: ['habitCompletions', 'yearly', user?.id],
    queryFn: async () => {
      if (!habits?.length) return []

      // Get all habit IDs
      const habitIds = habits.map((habit) => habit.id)

      // Fetch completions for all habits in the date range
      const completionsPromises = habitIds.map((id) => api.habitCompletions.getCompletions(id, startDate, endDate))

      const completionsArrays = await Promise.all(completionsPromises)

      // Flatten and return all completions
      return completionsArrays.flat()
    },
    enabled: !!user && !!habits?.length,
  })
}
