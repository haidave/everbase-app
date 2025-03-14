import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectEditForm } from '@/features/projects/components/project-edit-form'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircleIcon, Pencil } from 'lucide-react'

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
            <Button variant="secondary" size="sm" onClick={() => setEditingProject(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </CardFooter>
        </Card>

        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-medium">Project Tasks</h2>
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-4">
              <LoaderCircleIcon className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : relatedTasks && relatedTasks.length > 0 ? (
            <ul className="divide-y">
              {relatedTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between p-3">
                  <span className="truncate">{task.text}</span>
                  <span className="text-muted-foreground text-xs">{new Date(task.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No tasks assigned to this project yet.</p>
          )}
        </div>
      </div>

      {displayProject && (
        <ProjectEditForm
          project={displayProject}
          open={editingProject}
          onOpenChange={(open) => {
            setEditingProject(open)
          }}
        />
      )}
    </>
  )
}
