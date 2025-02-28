import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type NewTask, type Task } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all tasks
export function useTasks() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => api.tasks.getAll(user?.id || ''),
    enabled: !!user,
  })
}

// Hook for fetching a single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.tasks.getById(id),
    enabled: !!id,
  })
}

// Hook for creating a task
export function useCreateTask() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (task: Omit<NewTask, 'userId'>) => api.tasks.create({ ...task, userId: user?.id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
    },
  })
}

// Hook for updating a task
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) =>
      api.tasks.update(id, updates),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', updatedTask.userId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', updatedTask.id] })
    },
  })
}

// Hook for deleting a task
export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: api.tasks.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
    },
  })
}
