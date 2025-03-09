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
      // Invalidate all tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

      // Also invalidate user-specific tasks if you have them
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', user.id] })
      }
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
    }: { id: string } & Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) =>
      api.tasks.update(id, updates),

    // Add optimistic update
    onMutate: async ({ id, ...updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks', user?.id])

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old
        return old.map((task) => (task.id === id ? { ...task, ...updates } : task))
      })

      // Return a context object with the snapshotted value
      return { previousTasks }
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks)
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      // Invalidate user tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })

      // Also invalidate any project-related task queries
      // This will update task lists in project views
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project'],
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
      // Invalidate user tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })

      // Invalidate all project-related task queries
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project'] })

      // Also invalidate task-project relationships
      queryClient.invalidateQueries({ queryKey: ['tasks', 'projects'] })
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
