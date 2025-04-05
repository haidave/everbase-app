import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TaskFiltersState {
  projectId: string | null
  featureId: string | null
  setProjectId: (id: string | null) => void
  setFeatureId: (id: string | null) => void
  reset: () => void
}

export const useTaskFiltersStore = create<TaskFiltersState>()(
  persist(
    (set) => ({
      projectId: null,
      featureId: null,
      setProjectId: (id) =>
        set({
          projectId: id,
          // Reset feature when project changes
          featureId: id ? null : null,
        }),
      setFeatureId: (id) => set({ featureId: id }),
      reset: () => set({ projectId: null, featureId: null }),
    }),
    {
      name: 'task-kanban-filters',
    }
  )
)
