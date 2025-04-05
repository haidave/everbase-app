import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TaskFiltersState {
  projectId: string | null
  featureId: string | null
  groupByProject: boolean
  groupByFeatureInProjectView: boolean
  setProjectId: (id: string | null) => void
  setFeatureId: (id: string | null) => void
  setGroupByProject: (value: boolean) => void
  setGroupByFeatureInProjectView: (value: boolean) => void
  reset: () => void
}

export const useTaskFiltersStore = create<TaskFiltersState>()(
  persist(
    (set) => ({
      projectId: null,
      featureId: null,
      groupByProject: true,
      groupByFeatureInProjectView: true,
      setProjectId: (id) =>
        set({
          projectId: id,
          // Reset feature when project changes
          featureId: id ? null : null,
        }),
      setFeatureId: (id) => set({ featureId: id }),
      setGroupByProject: (value) => set({ groupByProject: value }),
      setGroupByFeatureInProjectView: (value) => set({ groupByFeatureInProjectView: value }),
      reset: () => set({ projectId: null, featureId: null }),
    }),
    {
      name: 'task-kanban-filters',
    }
  )
)
