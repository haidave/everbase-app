import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type Task } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all tasks
export function useTasks() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => api.tasks.getAll(),
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
    mutationFn: (task: { text: string }) => api.tasks.create(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
    },
  })
}

// Hook for updating a task
export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (updates: Partial<Task> & { id: string }) => api.tasks.update(updates.id, updates),
    onSuccess: (_, variables) => {
      // Invalidate tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })

      // Directly invalidate the project tasks query pattern
      queryClient.invalidateQueries({
        queryKey: ['projects'],
        predicate: (query) => {
          const queryKey = query.queryKey
          return Array.isArray(queryKey) && queryKey.length === 3 && queryKey[2] === 'tasks'
        },
      })

      // Also invalidate task-projects relationships
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.id, 'projects'],
      })
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
      // Invalidate tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })

      // Directly invalidate the project tasks query pattern
      queryClient.invalidateQueries({
        queryKey: ['projects'],
        predicate: (query) => {
          const queryKey = query.queryKey
          return Array.isArray(queryKey) && queryKey.length === 3 && queryKey[2] === 'tasks'
        },
      })
    },
  })
}

export function useGetTasksByProject(projectId: string) {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => api.projects.getTasks(projectId),
    enabled: !!projectId,
  })
}
