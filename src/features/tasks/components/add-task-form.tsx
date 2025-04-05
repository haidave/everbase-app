import { useRef, useState } from 'react'
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
import type { TaskStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useFeatures } from '@/hooks/use-features'
import { useProjects } from '@/hooks/use-projects'
import { useCreateTask } from '@/hooks/use-tasks'

type AddTaskFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
  defaultFeatureId?: string
}

const AddTaskForm = ({ open, onOpenChange, defaultProjectId, defaultFeatureId }: AddTaskFormProps) => {
  const createTask = useCreateTask()
  const { data: projects } = useProjects()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get features for the selected project
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '')
  const { data: features } = useFeatures(selectedProjectId)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId || '',
      featureId: defaultFeatureId || '',
      status: 'todo',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await createTask.mutateAsync({
          title: value.title.trim(),
          description: value.description || undefined,
          projectId: value.projectId || undefined,
          featureId: value.featureId || undefined,
          status: value.status as TaskStatus,
        })

        form.reset()
        onOpenChange(false)
      } catch (error) {
        console.error('Error creating task:', error)
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
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Add a new task to your list. Fill out the details below.</DialogDescription>
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
                    </>
                  )}
                </form.Field>
              </div>
            )}

            {features && features.length > 0 && selectedProjectId && (
              <div className="grid gap-2">
                <form.Field name="featureId">
                  {(field) => (
                    <>
                      <Label htmlFor="featureId">Feature (optional)</Label>
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
            <Button type="submit" disabled={isSubmitting || createTask.isPending || !form.state.canSubmit}>
              {isSubmitting || createTask.isPending ? (
                <>
                  <LoaderCircleIcon className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon />
                  Add Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddTaskForm }
