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
    mutationFn: async (task: { text: string; projectId?: string; featureId?: string }) => {
      // Create the task
      const newTask = await api.tasks.create({ text: task.text })

      // If projectId is provided, associate with project
      if (task.projectId) {
        await api.tasks.addToProject(newTask.id, task.projectId)
      }

      // If featureId is provided, associate with feature
      if (task.featureId) {
        await api.tasks.addToFeature(newTask.id, task.featureId)
      }

      return newTask
    },
    onSuccess: (_, variables) => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })

      // Invalidate project tasks if needed
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: ['projects', variables.projectId, 'tasks'],
          exact: true,
        })
      }

      // Invalidate feature tasks if needed
      if (variables.featureId) {
        queryClient.invalidateQueries({
          queryKey: ['features', variables.featureId, 'tasks'],
          exact: true,
        })
      }
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

      // Add this to invalidate feature tasks queries
      queryClient.invalidateQueries({
        queryKey: ['features'],
        predicate: (query) => {
          const queryKey = query.queryKey
          return Array.isArray(queryKey) && queryKey.length === 3 && queryKey[2] === 'tasks'
        },
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

      // Add this to invalidate feature tasks queries
      queryClient.invalidateQueries({
        queryKey: ['features'],
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
