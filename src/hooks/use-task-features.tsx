import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

// Hook for fetching features for multiple tasks
export function useTasksFeatures(taskIds: string[]) {
  return useQuery({
    queryKey: ['tasks', 'features', taskIds],
    queryFn: async () => {
      if (!taskIds.length) return {}

      const results = await Promise.all(
        taskIds.map(async (taskId) => {
          const features = await api.tasks.getFeatures(taskId)
          return { taskId, feature: features[0] || null }
        })
      )

      return results.reduce(
        (acc, { taskId, feature }) => {
          if (feature) {
            acc[taskId] = feature
          }
          return acc
        },
        {} as Record<string, { id: string; name: string }>
      )
    },
    enabled: taskIds.length > 0,
  })
}
