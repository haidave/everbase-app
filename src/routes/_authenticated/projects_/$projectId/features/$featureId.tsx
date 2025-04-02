import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { EditFeatureForm } from '@/features/projects/components/edit-feature-form'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
import { TaskList } from '@/features/tasks/components/task-list'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LoaderCircleIcon, Pencil, PlusIcon } from 'lucide-react'

import { api } from '@/lib/api'
import { useDynamicTitle } from '@/hooks/use-dynamic-title'
import { useFeature, useFeatureTasks } from '@/hooks/use-features'

export const Route = createFileRoute('/_authenticated/projects_/$projectId/features/$featureId')({
  loader: async ({ params }) => {
    const [feature, project] = await Promise.all([
      api.features.getById(params.featureId),
      api.projects.getById(params.projectId),
    ])
    return { feature, project }
  },

  head: ({ loaderData }) => {
    return {
      title: loaderData.feature.name,
      meta: [
        {
          title: loaderData.feature.name,
        },
      ],
    }
  },

  component: FeatureDetailPage,
})

function FeatureDetailPage() {
  const { projectId, featureId } = Route.useParams()
  const { feature: initialFeature, project } = Route.useLoaderData()
  const { data: feature, isLoading } = useFeature(featureId)
  const { data: tasks, isLoading: isLoadingTasks } = useFeatureTasks(featureId)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState(false)

  // Use the initial data from the loader or the fetched data
  const displayFeature = feature || initialFeature

  // Set the page title
  useDynamicTitle('/_authenticated/projects_/$projectId/features/$featureId', displayFeature.name, initialFeature.name)

  if (isLoading && !initialFeature) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircleIcon className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <DynamicIcon name={displayFeature.icon} className="size-4" />
              <CardTitle className="text-xl">{displayFeature.name}</CardTitle>
            </div>
            {project && (
              <Badge>
                <Link to="/projects/$projectId" params={{ projectId }}>
                  {project.name}
                </Link>
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {displayFeature.description && <p className="mb-4">{displayFeature.description}</p>}
            <p className="text-muted-foreground text-sm">
              Created on {new Date(displayFeature.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setEditingFeature(true)}>
              <Pencil />
              Edit
            </Button>
          </CardFooter>
        </Card>

        <div className="bg-card rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground-primary text-lg font-medium">Feature Tasks</h2>
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
              <PlusIcon />
              Add Task
            </Button>
          </div>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-4">
              <LoaderCircleIcon className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : tasks && tasks.length > 0 ? (
            <TaskList tasks={tasks} />
          ) : (
            <p className="text-muted-foreground">No tasks assigned to this feature yet.</p>
          )}
        </div>
      </div>

      {displayFeature && (
        <EditFeatureForm
          feature={displayFeature}
          open={editingFeature}
          onOpenChange={(open) => {
            setEditingFeature(open)
          }}
        />
      )}

      <AddTaskForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        defaultProjectId={projectId}
        defaultFeatureId={featureId}
      />
    </>
  )
}
