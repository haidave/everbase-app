import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BudgetFiltersState {
  hiddenItemIds: Set<string>
  toggleHideItem: (id: string) => void
  showAll: () => void
}

export const useBudgetFiltersStore = create<BudgetFiltersState>()(
  persist(
    (set) => ({
      hiddenItemIds: new Set(),
      toggleHideItem: (id) =>
        set((state) => {
          const newSet = new Set(state.hiddenItemIds)
          if (newSet.has(id)) {
            newSet.delete(id)
          } else {
            newSet.add(id)
          }
          return { hiddenItemIds: newSet }
        }),
      showAll: () => set({ hiddenItemIds: new Set() }),
    }),
    {
      name: 'budget-filters',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const { state } = JSON.parse(str)
          return {
            state: {
              ...state,
              hiddenItemIds: new Set(state.hiddenItemIds || []),
            },
          }
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              hiddenItemIds: Array.from(newValue.state.hiddenItemIds),
            },
          })
          localStorage.setItem(name, str)
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
