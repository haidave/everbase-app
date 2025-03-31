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
    mutationFn: (project: Pick<Project, 'name' | 'status' | 'icon'>) => api.projects.create(project),
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
    mutationFn: (project: Pick<Project, 'id' | 'name' | 'status' | 'icon'>) => api.projects.update(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })
    },
  })
}

// Hook for deleting a project
export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })
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
        queryKey: ['projects', variables.projectId, 'tasks'],
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
