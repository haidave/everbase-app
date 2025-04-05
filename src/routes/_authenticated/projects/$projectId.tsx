import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { EditProjectForm } from '@/features/projects/components/edit-project-form'
import { FeatureList } from '@/features/projects/components/feature-list'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
import { TaskKanbanBoard } from '@/features/tasks/components/task-kanban-board/task-kanban-board'
import { useTaskFiltersStore } from '@/store/use-task-filters-store'
import { createFileRoute } from '@tanstack/react-router'
import { GroupIcon, LoaderCircleIcon, Pencil, PlusIcon, UngroupIcon } from 'lucide-react'

import { api } from '@/lib/api'
import { useDynamicTitle } from '@/hooks/use-dynamic-title'
import { useProject, useProjectTasks } from '@/hooks/use-projects'

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  loader: async ({ params }) => {
    const project = await api.projects.getById(params.projectId)
    return { project }
  },

  head: ({ loaderData }) => {
    return {
      title: loaderData.project.name,
      meta: [
        {
          title: loaderData.project.name,
        },
      ],
    }
  },

  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const { project: initialProject } = Route.useLoaderData()
  const { data: relatedTasks, isLoading: isLoadingTasks } = useProjectTasks(projectId)
  const [editingProject, setEditingProject] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { groupByFeatureInProjectView, setGroupByFeatureInProjectView } = useTaskFiltersStore()

  // Get real-time updates from the server
  const { data: updatedProject, isLoading, error } = useProject(projectId)
  // Use the initial data from loader, but prefer real-time data when available
  const displayProject = updatedProject || initialProject
  // Update title and breadcrumbs when project name changes
  useDynamicTitle('/_authenticated/projects/$projectId', updatedProject?.name, initialProject.name)

  if (isLoading && !initialProject) return <div className="p-4">Loading project...</div>
  if (error && !initialProject) return <div className="p-4 text-red-500">Error loading project: {error.message}</div>
  if (!displayProject) return <div className="p-4">Project not found</div>

  return (
    <>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <DynamicIcon name={displayProject.icon} className="size-5" />
                <CardTitle className="text-xl">{displayProject.name}</CardTitle>
              </div>
              <Badge>{displayProject.status}</Badge>
            </div>
            <Button onClick={() => setEditingProject(true)}>
              <Pencil />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            {displayProject.description ? (
              <p className="text-muted-foreground mt-2 text-sm">{displayProject.description}</p>
            ) : null}
          </CardContent>
        </Card>

        <FeatureList projectId={projectId} />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground-primary text-lg font-medium">Project Tasks</h2>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
                <PlusIcon />
                Add Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setGroupByFeatureInProjectView(!groupByFeatureInProjectView)}
                className="text-muted-foreground flex items-center gap-1"
              >
                {groupByFeatureInProjectView ? <UngroupIcon /> : <GroupIcon />}
                {groupByFeatureInProjectView ? 'Ungroup' : 'Group by Feature'}
              </Button>
            </div>
          </div>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-4">
              <LoaderCircleIcon className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : relatedTasks && relatedTasks.length > 0 ? (
            <TaskKanbanBoard tasks={relatedTasks} isProjectView={true} />
          ) : (
            <p className="text-muted-foreground text-sm">No tasks assigned to this project yet.</p>
          )}
        </div>
      </div>

      {displayProject && (
        <EditProjectForm
          project={displayProject}
          open={editingProject}
          onOpenChange={(open) => {
            setEditingProject(open)
          }}
        />
      )}

      <AddTaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} defaultProjectId={projectId} />
    </>
  )
}
