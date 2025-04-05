import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

// Original hook for a single task
export function useTaskProjects(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'projects'],
    queryFn: () => api.taskProjects.getProjectsForTask(taskId),
    enabled: !!taskId,
  })
}

// Hook for multiple tasks with optimized batching
export function useTasksProjects(taskIds: string[]) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['tasks', 'batch', 'projects', taskIds],
    queryFn: async () => {
      const projectsMap: Record<string, { id: string; name: string }> = {}

      // Check cache first for each task
      const uncachedTaskIds = taskIds.filter((taskId) => {
        const cachedData = queryClient.getQueryData(['tasks', taskId, 'projects'])
        if (cachedData) {
          const projects = cachedData as { id: string; name: string }[]
          if (projects && projects.length > 0) {
            projectsMap[taskId] = {
              id: projects[0].id,
              name: projects[0].name,
            }
            return false
          }
        }
        return true
      })

      // Only fetch uncached data
      if (uncachedTaskIds.length > 0) {
        // Batch fetch in groups of 10 to avoid too many parallel requests
        const batchSize = 10
        for (let i = 0; i < uncachedTaskIds.length; i += batchSize) {
          const batch = uncachedTaskIds.slice(i, i + batchSize)
          await Promise.all(
            batch.map(async (taskId) => {
              try {
                const projects = await api.taskProjects.getProjectsForTask(taskId)
                if (projects && projects.length > 0) {
                  projectsMap[taskId] = {
                    id: projects[0].id,
                    name: projects[0].name,
                  }
                  // Update individual cache
                  queryClient.setQueryData(['tasks', taskId, 'projects'], projects)
                }
              } catch (error) {
                console.error(`Error fetching project for task ${taskId}:`, error)
              }
            })
          )
        }
      }

      return projectsMap
    },
    enabled: taskIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
