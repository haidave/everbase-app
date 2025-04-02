import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type Feature } from '@/lib/api'

// Hook for fetching features for a project
export function useFeatures(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'features'],
    queryFn: () => api.features.getAll(projectId),
    enabled: !!projectId,
  })
}

// Hook for fetching a single feature
export function useFeature(id: string) {
  return useQuery({
    queryKey: ['features', id],
    queryFn: () => api.features.getById(id),
    enabled: !!id,
  })
}

// Hook for creating a feature
export function useCreateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>) => api.features.create(feature),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'features'] })
    },
  })
}

// Hook for updating a feature
export function useUpdateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feature: Partial<Feature> & { id: string }) => api.features.update(feature),
    onSuccess: (_, variables) => {
      // Only invalidate the specific feature
      queryClient.invalidateQueries({
        queryKey: ['features', variables.id],
        exact: true,
      })

      if (variables.projectId) {
        // Only invalidate the project's features list
        queryClient.invalidateQueries({
          queryKey: ['projects', variables.projectId, 'features'],
          exact: true,
        })
      }
    },
  })
}

// Hook for deleting a feature
export function useDeleteFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feature: { id: string; projectId: string }) => api.features.delete(feature.id),
    onMutate: async (feature) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['projects', feature.projectId, 'features'],
      })

      // Snapshot the previous features list
      const previousFeatures = queryClient.getQueryData<Feature[]>(['projects', feature.projectId, 'features'])

      // Optimistically remove the feature from the list
      if (previousFeatures) {
        queryClient.setQueryData(
          ['projects', feature.projectId, 'features'],
          previousFeatures.filter((f) => f.id !== feature.id)
        )
      }

      return { previousFeatures }
    },
    onError: (_, feature, context) => {
      // Roll back on error
      if (context?.previousFeatures) {
        queryClient.setQueryData(['projects', feature.projectId, 'features'], context.previousFeatures)
      }
    },
    onSuccess: (_, feature) => {
      // Remove the specific feature query data
      queryClient.removeQueries({ queryKey: ['features', feature.id] })

      // Invalidate any tasks that might be associated with this feature
      queryClient.invalidateQueries({
        queryKey: ['features', feature.id, 'tasks'],
        exact: true,
      })

      // Invalidate all tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Hook for fetching tasks for a feature
export function useFeatureTasks(featureId: string) {
  return useQuery({
    queryKey: ['features', featureId, 'tasks'],
    queryFn: () => api.features.getTasks(featureId),
    enabled: !!featureId,
  })
}

// Hook for adding a task to a feature
export function useAddTaskToFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, featureId }: { taskId: string; featureId: string }) =>
      api.tasks.addToFeature(taskId, featureId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['features', variables.featureId, 'tasks'],
      })
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId, 'features'],
      })
    },
  })
}

// Hook for removing a task from a feature
export function useRemoveTaskFromFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, featureId }: { taskId: string; featureId: string }) =>
      api.tasks.removeFromFeature(taskId, featureId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['features', variables.featureId, 'tasks'],
      })
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId, 'features'],
      })
    },
  })
}

// Hook for fetching features for a task
export function useTaskFeatures(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'features'],
    queryFn: () => api.tasks.getFeatures(taskId),
    enabled: !!taskId,
  })
}
