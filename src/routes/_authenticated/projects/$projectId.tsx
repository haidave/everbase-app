import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { EditProjectForm } from '@/features/projects/components/edit-project-form'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
import { TaskList } from '@/features/tasks/components/task-list'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircleIcon, Pencil, PlusIcon } from 'lucide-react'

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
      <div className="mx-auto max-w-3xl">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">{displayProject.name}</CardTitle>
            <Badge>{displayProject.status}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Created on {new Date(displayProject.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setEditingProject(true)}>
              <Pencil />
              Edit
            </Button>
          </CardFooter>
        </Card>

        <div className="bg-card rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground-primary text-lg font-medium">Project Tasks</h2>
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
              <PlusIcon />
              Add Task
            </Button>
          </div>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-4">
              <LoaderCircleIcon className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : relatedTasks && relatedTasks.length > 0 ? (
            <TaskList tasks={relatedTasks} />
          ) : (
            <p className="text-muted-foreground">No tasks assigned to this project yet.</p>
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
