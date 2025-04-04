import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

// Hook for updating task associations (both project and feature)
export function useUpdateTaskAssociations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      currentProjectId,
      newProjectId,
      currentFeatureId,
      newFeatureId,
    }: {
      taskId: string
      currentProjectId?: string | null
      newProjectId?: string | null
      currentFeatureId?: string | null
      newFeatureId?: string | null
    }) => {
      // Handle project association changes
      if (newProjectId) {
        // If there's a current project and it's different, update it
        if (currentProjectId && currentProjectId !== newProjectId) {
          await api.taskProjects.removeTaskFromProject(taskId, currentProjectId)
          await api.taskProjects.addTaskToProject(taskId, newProjectId)
        }
        // If there's no current project, add the new one
        else if (!currentProjectId) {
          await api.taskProjects.addTaskToProject(taskId, newProjectId)
        }
      } else if (currentProjectId) {
        // If project was removed, remove the association
        await api.taskProjects.removeTaskFromProject(taskId, currentProjectId)
      }

      // Handle feature association changes
      if (newFeatureId) {
        // If there's a current feature and it's different, update it
        if (currentFeatureId && currentFeatureId !== newFeatureId) {
          await api.tasks.removeFromFeature(taskId, currentFeatureId)
          await api.tasks.addToFeature(taskId, newFeatureId)
        }
        // If there's no current feature, add the new one
        else if (!currentFeatureId) {
          await api.tasks.addToFeature(taskId, newFeatureId)
        }
      } else if (currentFeatureId) {
        // If feature was removed, remove the association
        await api.tasks.removeFromFeature(taskId, currentFeatureId)
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate task associations
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId, 'projects'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId, 'features'] })

      // Invalidate project tasks if needed
      if (variables.currentProjectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.currentProjectId, 'tasks'] })
      }
      if (variables.newProjectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.newProjectId, 'tasks'] })
      }

      // Invalidate feature tasks if needed
      if (variables.currentFeatureId) {
        queryClient.invalidateQueries({ queryKey: ['features', variables.currentFeatureId, 'tasks'] })
      }
      if (variables.newFeatureId) {
        queryClient.invalidateQueries({ queryKey: ['features', variables.newFeatureId, 'tasks'] })
      }

      // Invalidate all tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
