import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type Project } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all projects
export function useProjects() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => api.projects.getAll(),
    enabled: !!user,
  })
}

// Hook for fetching a single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.projects.getById(id),
    enabled: !!id,
  })
}

// Hook for creating a project
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (project: { name: string; status?: 'backlog' | 'active' | 'passive' | 'completed' }) =>
      api.projects.create(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })
    },
  })
}

// Hook for updating a project
export function useUpdateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Pick<Project, 'name' | 'status'>>) =>
      api.projects.update(id, updates),
    onSuccess: (_, variables) => {
      // Invalidate projects
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })

      // Force refetch ALL task-project relationships
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        refetchType: 'all',
      })

      // Force refetch the specific project data
      queryClient.refetchQueries({
        queryKey: ['projects', variables.id],
        exact: false,
      })

      // Force refetch all task-project relationships
      queryClient.refetchQueries({
        queryKey: ['tasks', '*', 'projects'],
        exact: false,
      })
    },
  })
}

// Hook for deleting a project
export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: api.projects.delete,
    onSuccess: (_, projectId) => {
      // Invalidate projects
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })

      // Invalidate all task-project relationships
      queryClient.invalidateQueries({ queryKey: ['tasks', 'projects'] })

      // Invalidate tasks for this specific project
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] })

      // Also invalidate general tasks as they might show project info
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Hook for fetching tasks for a project
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'tasks'],
    queryFn: () => api.projects.getTasks(projectId),
    enabled: !!projectId,
  })
}

// Hook for adding a task to a project
export function useAddTaskToProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, projectId }: { taskId: string; projectId: string }) => {
      return api.tasks.addToProject(taskId, projectId)
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific task's projects query
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId, 'projects'],
      })

      // Invalidate the specific project's tasks query
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project', variables.projectId],
      })

      // Also invalidate the general tasks query
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })

      // Optionally invalidate the projects query if it shows task counts
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      })
    },
  })
}

// Hook for removing a task from a project
export function useRemoveTaskFromProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, projectId }: { taskId: string; projectId: string }) =>
      api.taskProjects.removeTaskFromProject(taskId, projectId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId, 'projects'] })
    },
  })
}
