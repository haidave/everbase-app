import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching all subscriptions
export function useSubscriptions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: () => api.subscriptions.getAll(),
    enabled: !!user,
  })
}

// Hook for creating a subscription
export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (subscription: {
      name: string
      price: string
      currency: string
      frequency: 'monthly' | 'yearly'
      renewalDay: number
      renewalMonth?: number
      startDate: Date
      description?: string
      active: boolean
    }) =>
      api.subscriptions.create({
        ...subscription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] })
    },
  })
}

// Hook for updating a subscription
export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string
      name?: string
      price?: string
      currency?: string
      frequency?: 'monthly' | 'yearly'
      renewalDay?: number
      renewalMonth?: number | null
      startDate?: Date
      description?: string
      active?: boolean
    }) => api.subscriptions.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] })
    },
  })
}

// Hook for deleting a subscription
export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.subscriptions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] })
    },
  })
}
