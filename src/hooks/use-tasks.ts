import type { TaskStatus } from '@/db/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type Task } from '@/lib/api'
import { supabase } from '@/lib/supabase'

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
    mutationFn: async (task: {
      title: string
      description?: string
      projectId?: string
      featureId?: string
      status?: TaskStatus
      order?: number
    }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const status = task.status || 'todo'

      // Find the minimum order value in the same status column
      const { data: minOrderTask } = await supabase
        .from('tasks')
        .select('order')
        .eq('status', status)
        .eq('user_id', user.id)
        .order('order', { ascending: true })
        .limit(1)
        .single()

      // Calculate new order value
      const newOrder = minOrderTask ? minOrderTask.order - 10 : 1000

      // Create the task with the new order value
      const newTask = await api.tasks.create({
        title: task.title,
        description: task.description || undefined,
        status,
        order: newOrder,
      })

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

      // Invalidate all tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

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

// Hook for updating a task
export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Partial<Pick<Task, 'title' | 'description' | 'status' | 'order'>>) =>
      api.tasks.update(id, updates),
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
