import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { useAuth } from './use-auth'

// Hook for fetching budget balance
export function useBudgetBalance() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['budgetBalance', user?.id],
    queryFn: () => api.budgetBalance.get(),
    enabled: !!user,
  })
}

// Hook for creating or updating budget balance
export function useUpdateBudgetBalance() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ amount, currency = 'CZK' }: { amount: string; currency?: string }) =>
      api.budgetBalance.createOrUpdate(amount, currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetBalance', user?.id] })
    },
  })
}

// Hook for fetching all budget items
export function useBudgetItems() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['budgetItems', user?.id],
    queryFn: () => api.budgetItems.getAll(),
    enabled: !!user,
  })
}

// Hook for creating a budget item
export function useCreateBudgetItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (item: {
      name: string
      amount?: string
      amountPaid?: string
      paid?: boolean
      note?: string
      order?: number
    }) => api.budgetItems.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems', user?.id] })
    },
  })
}

// Hook for updating a budget item
export function useUpdateBudgetItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string
      name?: string
      amount?: string
      amountPaid?: string
      paid?: boolean
      note?: string
      order?: number
    }) => api.budgetItems.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['budgetSubItems'] })
    },
  })
}

// Hook for deleting a budget item
export function useDeleteBudgetItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => api.budgetItems.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['budgetSubItems'] })
    },
  })
}

// Hook for fetching sub-items for a budget item
export function useBudgetSubItems(budgetItemId: string) {
  return useQuery({
    queryKey: ['budgetSubItems', budgetItemId],
    queryFn: () => api.budgetSubItems.getAll(budgetItemId),
    enabled: !!budgetItemId,
  })
}

// Hook for creating a budget sub-item
export function useCreateBudgetSubItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (subItem: {
      budgetItemId: string
      name: string
      amount: string
      amountPaid?: string
      paid?: boolean
      note?: string
      order?: number
    }) => api.budgetSubItems.create(subItem),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgetSubItems', variables.budgetItemId] })
      queryClient.invalidateQueries({ queryKey: ['budgetItems', user?.id] })
    },
  })
}

// Hook for updating a budget sub-item
export function useUpdateBudgetSubItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string
      budgetItemId: string
      name?: string
      amount?: string
      amountPaid?: string
      paid?: boolean
      note?: string
      order?: number
    }) => api.budgetSubItems.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgetSubItems', variables.budgetItemId] })
      queryClient.invalidateQueries({ queryKey: ['budgetItems', user?.id] })
    },
  })
}

// Hook for deleting a budget sub-item
export function useDeleteBudgetSubItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id }: { id: string; budgetItemId: string }) => api.budgetSubItems.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgetSubItems', variables.budgetItemId] })
      queryClient.invalidateQueries({ queryKey: ['budgetItems', user?.id] })
    },
  })
}
