import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'
import { useTaskFiltersStore } from '@/store/use-task-filters-store'

import { useFeatures } from '@/hooks/use-features'
import { useProjects } from '@/hooks/use-projects'

export function TaskKanbanFilters() {
  // Get state from Zustand store
  const { projectId, featureId, setProjectId, setFeatureId, reset } = useTaskFiltersStore()

  // Fetch data
  const { data: projects, isLoading: isLoadingProjects } = useProjects()
  const { data: features, isLoading: isLoadingFeatures } = useFeatures(projectId || '')

  // Handle project selection
  const handleProjectChange = (value: string) => {
    setProjectId(value || null)
  }

  // Handle feature selection
  const handleFeatureChange = (value: string) => {
    setFeatureId(value || null)
  }

  // Check if the selected project has any features
  const hasFeatures = features && features.length > 0

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-2">
        {isLoadingProjects ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <Combobox
            size="default"
            isContentSameWidth={false}
            options={
              projects?.map((project) => ({
                value: project.id,
                label: project.name,
              })) || []
            }
            value={projectId || ''}
            onValueChange={handleProjectChange}
            placeholder="Project"
            emptyMessage="No projects found."
            searchPlaceholder="Search projects..."
          />
        )}
      </div>

      {projectId && hasFeatures && (
        <div className="grid gap-2">
          {isLoadingFeatures ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <Combobox
              size="default"
              isContentSameWidth={false}
              options={
                features?.map((feature) => ({
                  value: feature.id,
                  label: feature.name,
                })) || []
              }
              value={featureId || ''}
              onValueChange={handleFeatureChange}
              placeholder="Feature"
              emptyMessage="No features found."
              searchPlaceholder="Search features..."
            />
          )}
        </div>
      )}

      {projectId || featureId ? (
        <Button variant="ghost" onClick={reset} title="Reset filters" className="text-muted-foreground self-end">
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}
