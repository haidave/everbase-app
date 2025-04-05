import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextareaAutosize } from '@/components/ui/textarea'
import type { Task, TaskStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useFeatures, useTaskFeatures } from '@/hooks/use-features'
import { useProjects } from '@/hooks/use-projects'
import { useUpdateTaskAssociations } from '@/hooks/use-task-associations'
import { useTaskProjects } from '@/hooks/use-task-projects'
import { useUpdateTask } from '@/hooks/use-tasks'

type EditTaskFormProps = {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskForm({ task, open, onOpenChange }: EditTaskFormProps) {
  const updateTask = useUpdateTask()
  const { data: projects } = useProjects()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current project and feature associations
  const { data: taskProjects, isLoading: isLoadingProjects } = useTaskProjects(task.id)
  const { data: taskFeatures, isLoading: isLoadingFeatures } = useTaskFeatures(task.id)

  const currentProject = taskProjects && taskProjects.length > 0 ? taskProjects[0] : null
  const currentFeature = taskFeatures && taskFeatures.length > 0 ? taskFeatures[0] : null

  // Get features for the selected project
  // Initialize with currentProject.id if available, and update when data loads
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const { data: features } = useFeatures(selectedProjectId)

  // Update selectedProjectId when taskProjects loads
  useEffect(() => {
    if (currentProject?.id) {
      setSelectedProjectId(currentProject.id)
    }
  }, [currentProject])

  const updateTaskAssociations = useUpdateTaskAssociations()

  const form = useForm({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      projectId: currentProject?.id || '',
      featureId: currentFeature?.id || '',
      status: task.status,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        // Update the task's basic properties
        await updateTask.mutateAsync({
          id: task.id,
          title: value.title.trim(),
          description: value.description || '',
          status: value.status as TaskStatus,
        })

        // Update task associations
        await updateTaskAssociations.mutateAsync({
          taskId: task.id,
          currentProjectId: currentProject?.id,
          newProjectId: value.projectId || null,
          currentFeatureId: currentFeature?.id,
          newFeatureId: value.featureId || null,
        })

        onOpenChange(false)
      } catch (error) {
        console.error('Error updating task:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  useHotkeys(
    'mod+enter',
    () => {
      if (formRef.current?.contains(document.activeElement)) {
        formRef.current?.requestSubmit()
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: ['INPUT', 'SELECT'],
    }
  )

  // Handle project selection changes
  const handleProjectChange = (projectId: string) => {
    form.setFieldValue('projectId', projectId)
    form.setFieldValue('featureId', '') // Reset feature when project changes
    setSelectedProjectId(projectId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update your task details below.</DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <form.Field
                name="title"
                validators={{
                  onSubmit: ({ value }) => (!value?.trim() ? 'Task title cannot be empty' : null),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Task title"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors?.length}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <em role="alert" className="text-destructive text-sm">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="grid gap-2">
              <form.Field name="description">
                {(field) => (
                  <>
                    <Label htmlFor="description">Description (optional)</Label>
                    <TextareaAutosize
                      id="description"
                      placeholder="Task description"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </>
                )}
              </form.Field>
            </div>

            {projects && projects.length > 0 && (
              <div className="grid gap-2">
                <form.Field name="projectId">
                  {(field) => (
                    <>
                      <Label htmlFor="projectId">Project (optional)</Label>
                      {isLoadingProjects ? (
                        <div className="border-input bg-background flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm">
                          <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                          Loading projects...
                        </div>
                      ) : (
                        <Combobox
                          options={projects.map((project) => ({
                            value: project.id,
                            label: project.name,
                          }))}
                          value={field.state.value}
                          onValueChange={handleProjectChange}
                          placeholder="Select project"
                          emptyMessage="No project found."
                          searchPlaceholder="Search project..."
                        />
                      )}
                    </>
                  )}
                </form.Field>
              </div>
            )}

            {selectedProjectId && (
              <div className="grid gap-2">
                <form.Field name="featureId">
                  {(field) => (
                    <>
                      <Label htmlFor="featureId">Feature (optional)</Label>
                      {isLoadingFeatures ? (
                        <div className="border-input bg-background flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm">
                          <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                          Loading features...
                        </div>
                      ) : features && features.length > 0 ? (
                        <Combobox
                          options={features.map((feature) => ({
                            value: feature.id,
                            label: feature.name,
                          }))}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          placeholder="Select feature"
                          emptyMessage="No feature found."
                          searchPlaceholder="Search feature..."
                        />
                      ) : (
                        <div className="border-input bg-background text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm">
                          No features available for this project
                        </div>
                      )}
                    </>
                  )}
                </form.Field>
              </div>
            )}

            <div className="grid gap-2">
              <form.Field name="status">
                {(field) => (
                  <>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as TaskStatus)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              </form.Field>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || updateTask.isPending || !form.state.canSubmit}>
              {isSubmitting || updateTask.isPending ? (
                <>
                  <LoaderCircleIcon className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
