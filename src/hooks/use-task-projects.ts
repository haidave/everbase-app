import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

export function useTaskProjects(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'projects'],
    queryFn: () => api.taskProjects.getProjectsForTask(taskId),
    enabled: !!taskId,
  })
}
