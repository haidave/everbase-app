import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type Habit, type HabitCompletion } from '@/lib/api'
import { formatDateString } from '@/lib/formatters'

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

// Hook for getting today's habit completions
export function useTodayHabitCompletions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habitCompletions', 'today', user?.id],
    queryFn: async () => {
      if (!user) return []
      return api.habitCompletions.getTodayCompletions()
    },
    enabled: !!user,
    select: (data) => {
      const todayStr = formatDateString(new Date())
      return data.filter((completion) => {
        const completionStr = formatDateString(new Date(completion.completedAt))
        return completionStr === todayStr
      })
    },
  })
}

// Hook for completing a habit (today)
export function useCompleteHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (habitId: string) => api.habitCompletions.completeHabit(habitId),
    // Optimistic update
    onMutate: async (habitId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['habitCompletions', 'today', user?.id] })

      // Snapshot the previous value
      const previousTodayCompletions = queryClient.getQueryData<HabitCompletion[]>([
        'habitCompletions',
        'today',
        user?.id,
      ])

      // Create a normalized date for consistent formatting
      const today = new Date()
      const normalizedDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0))

      // Optimistically update today's completions
      queryClient.setQueryData<HabitCompletion[]>(['habitCompletions', 'today', user?.id], (old) => {
        const optimisticCompletion: HabitCompletion = {
          id: `temp-${Date.now()}`,
          habitId,
          completedAt: normalizedDate,
        }

        if (!old) return [optimisticCompletion]
        return [...old, optimisticCompletion]
      })

      // Also update the calendar data
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      const queryKey = ['habitCompletions', habitId, startOfMonth.toISOString(), endOfMonth.toISOString()]

      const previousMonthCompletions = queryClient.getQueryData<HabitCompletion[]>(queryKey)

      queryClient.setQueryData<HabitCompletion[]>(queryKey, (old) => {
        const optimisticCompletion: HabitCompletion = {
          id: `temp-${Date.now()}-calendar`,
          habitId,
          completedAt: normalizedDate,
        }

        if (!old) return [optimisticCompletion]
        return [...old, optimisticCompletion]
      })

      return { previousTodayCompletions, previousMonthCompletions, queryKey }
    },
    onError: (_, __, context: MutationContext | undefined) => {
      // If the mutation fails, roll back
      if (context?.previousTodayCompletions) {
        queryClient.setQueryData(['habitCompletions', 'today', user?.id], context.previousTodayCompletions)
      }
      if (context?.previousMonthCompletions && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMonthCompletions)
      }
    },
    onSettled: (_, __, habitId) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['habitCompletions', 'today', user?.id] })

      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', habitId, startOfMonth.toISOString(), endOfMonth.toISOString()],
      })
    },
  })
}

// Hook for uncompleting a habit (today)
export function useUncompleteHabit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (habitId: string) => api.habitCompletions.removeCompletion(habitId),
    // Optimistic update
    onMutate: async (habitId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['habitCompletions', 'today', user?.id] })

      // Snapshot the previous value
      const previousTodayCompletions = queryClient.getQueryData<HabitCompletion[]>([
        'habitCompletions',
        'today',
        user?.id,
      ])

      // Optimistically update today's completions
      queryClient.setQueryData<HabitCompletion[]>(['habitCompletions', 'today', user?.id], (old) => {
        if (!old) return []
        return old.filter((completion) => completion.habitId !== habitId)
      })

      // Also update the calendar data
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      const queryKey = ['habitCompletions', habitId, startOfMonth.toISOString(), endOfMonth.toISOString()]

      const previousMonthCompletions = queryClient.getQueryData<HabitCompletion[]>(queryKey)

      queryClient.setQueryData<HabitCompletion[]>(queryKey, (old) => {
        if (!old) return []

        const todayStr = formatDateString(today)

        return old.filter((completion) => {
          const completionStr = formatDateString(new Date(completion.completedAt))
          return completionStr !== todayStr || completion.habitId !== habitId
        })
      })

      return { previousTodayCompletions, previousMonthCompletions, queryKey }
    },
    onError: (_, __, context: MutationContext | undefined) => {
      // If the mutation fails, roll back
      if (context?.previousTodayCompletions) {
        queryClient.setQueryData(['habitCompletions', 'today', user?.id], context.previousTodayCompletions)
      }
      if (context?.previousMonthCompletions && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMonthCompletions)
      }
    },
    onSettled: (_, __, habitId) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['habitCompletions', 'today', user?.id] })

      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', habitId, startOfMonth.toISOString(), endOfMonth.toISOString()],
      })
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

// Hook for completing a habit on a specific date
export function useCompleteHabitForDate() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: Date }) =>
      api.habitCompletions.completeHabitForDate(habitId, date),
    onMutate: async ({ habitId, date }) => {
      // Cancel any outgoing refetches for all related queries
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const monthQueryKey = ['habitCompletions', habitId, startDate.toISOString(), endDate.toISOString()]
      const allCompletionsKey = ['habitCompletions', 'all', habitId]
      const todayQueryKey = ['habitCompletions', 'today', user?.id]

      await queryClient.cancelQueries({ queryKey: monthQueryKey })
      await queryClient.cancelQueries({ queryKey: allCompletionsKey })
      await queryClient.cancelQueries({ queryKey: todayQueryKey })

      // Snapshot the previous values
      const previousMonthCompletions = queryClient.getQueryData<HabitCompletion[]>(monthQueryKey)
      const previousAllCompletions = queryClient.getQueryData<HabitCompletion[]>(allCompletionsKey)
      const previousTodayCompletions = queryClient.getQueryData<HabitCompletion[]>(todayQueryKey)

      // Create a normalized date for consistent formatting
      const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))

      // Optimistically update month view
      queryClient.setQueryData<HabitCompletion[]>(monthQueryKey, (old) => {
        const optimisticCompletion: HabitCompletion = {
          id: `temp-${Date.now()}`,
          habitId,
          completedAt: normalizedDate,
        }

        if (!old) return [optimisticCompletion]
        return [...old, optimisticCompletion]
      })

      // Optimistically update all completions
      queryClient.setQueryData<HabitCompletion[]>(allCompletionsKey, (old) => {
        const optimisticCompletion: HabitCompletion = {
          id: `temp-${Date.now()}-all`,
          habitId,
          completedAt: normalizedDate,
        }

        if (!old) return [optimisticCompletion]
        return [...old, optimisticCompletion]
      })

      // Check if this is today's date and update today's completions if needed
      const todayStr = formatDateString(new Date())
      const dateStr = formatDateString(date)

      if (todayStr === dateStr) {
        queryClient.setQueryData<HabitCompletion[]>(todayQueryKey, (old) => {
          const optimisticCompletion: HabitCompletion = {
            id: `temp-${Date.now()}-today`,
            habitId,
            completedAt: normalizedDate,
          }

          if (!old) return [optimisticCompletion]
          return [...old, optimisticCompletion]
        })
      }

      return {
        previousMonthCompletions,
        previousAllCompletions,
        previousTodayCompletions,
        monthQueryKey,
        allCompletionsKey,
        todayQueryKey,
        isTodayCompletion: todayStr === dateStr,
      }
    },
    onError: (_, variables, context) => {
      if (context?.previousMonthCompletions) {
        queryClient.setQueryData(context.monthQueryKey, context.previousMonthCompletions)
      }

      if (context?.previousAllCompletions) {
        queryClient.setQueryData(context.allCompletionsKey, context.previousAllCompletions)
      }

      if (context?.isTodayCompletion && context.previousTodayCompletions) {
        queryClient.setQueryData(context.todayQueryKey, context.previousTodayCompletions)
      }
    },
    onSettled: (_, __, variables) => {
      const { habitId, date } = variables

      // Calculate month range for the calendar view
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', habitId, startDate.toISOString(), endDate.toISOString()],
      })

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', 'all', habitId],
      })

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', 'today', user?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', 'yearly', user?.id],
      })
    },
  })
}

// Hook for uncompleting a habit on a specific date
export function useUncompleteHabitForDate() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: Date }) =>
      api.habitCompletions.uncompleteHabitForDate(habitId, date),
    onMutate: async ({ habitId, date }) => {
      // Cancel any outgoing refetches for all related queries
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const monthQueryKey = ['habitCompletions', habitId, startDate.toISOString(), endDate.toISOString()]
      const allCompletionsKey = ['habitCompletions', 'all', habitId]
      const todayQueryKey = ['habitCompletions', 'today', user?.id]

      await queryClient.cancelQueries({ queryKey: monthQueryKey })
      await queryClient.cancelQueries({ queryKey: allCompletionsKey })
      await queryClient.cancelQueries({ queryKey: todayQueryKey })

      // Snapshot the previous values
      const previousMonthCompletions = queryClient.getQueryData<HabitCompletion[]>(monthQueryKey)
      const previousAllCompletions = queryClient.getQueryData<HabitCompletion[]>(allCompletionsKey)
      const previousTodayCompletions = queryClient.getQueryData<HabitCompletion[]>(todayQueryKey)

      // Format the date string for comparison
      const dateStr = formatDateString(date)

      // Optimistically update month view
      queryClient.setQueryData<HabitCompletion[]>(monthQueryKey, (old) => {
        if (!old) return []
        return old.filter((completion) => {
          const completionDate = new Date(completion.completedAt)
          return formatDateString(completionDate) !== dateStr
        })
      })

      // Optimistically update all completions
      queryClient.setQueryData<HabitCompletion[]>(allCompletionsKey, (old) => {
        if (!old) return []
        return old.filter((completion) => {
          const completionDate = new Date(completion.completedAt)
          return formatDateString(completionDate) !== dateStr
        })
      })

      // Check if this is today's date and update today's completions if needed
      const todayStr = formatDateString(new Date())

      if (todayStr === dateStr) {
        queryClient.setQueryData<HabitCompletion[]>(todayQueryKey, (old) => {
          if (!old) return []
          return old.filter((completion) => completion.habitId !== habitId)
        })
      }

      return {
        previousMonthCompletions,
        previousAllCompletions,
        previousTodayCompletions,
        monthQueryKey,
        allCompletionsKey,
        todayQueryKey,
        isTodayCompletion: todayStr === dateStr,
      }
    },
    onError: (_, variables, context) => {
      if (context?.previousMonthCompletions) {
        queryClient.setQueryData(context.monthQueryKey, context.previousMonthCompletions)
      }

      if (context?.previousAllCompletions) {
        queryClient.setQueryData(context.allCompletionsKey, context.previousAllCompletions)
      }

      if (context?.isTodayCompletion && context.previousTodayCompletions) {
        queryClient.setQueryData(context.todayQueryKey, context.previousTodayCompletions)
      }
    },
    onSettled: (_, __, variables) => {
      const { habitId, date } = variables

      // Calculate month range for the calendar view
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', habitId, startDate.toISOString(), endDate.toISOString()],
      })

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', 'all', habitId],
      })

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', 'today', user?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', 'yearly', user?.id],
      })
    },
  })
}

export function useAllHabitCompletions(habitId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habitCompletions', 'all', habitId],
    queryFn: () => api.habitCompletions.getAllCompletions(habitId),
    enabled: !!user && !!habitId,
  })
}

type MutationContext = {
  previousTodayCompletions: HabitCompletion[] | undefined
  previousMonthCompletions: HabitCompletion[] | undefined
  queryKey: unknown[]
}
