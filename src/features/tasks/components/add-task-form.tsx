import { useRef } from 'react'
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
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useAddTaskToProject, useProjects } from '@/hooks/use-projects'
import { useCreateTask } from '@/hooks/use-tasks'

type AddTaskFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

const AddTaskForm = ({ open, onOpenChange, defaultProjectId }: AddTaskFormProps) => {
  const createTask = useCreateTask()
  const { data: projects } = useProjects()
  const addTaskToProject = useAddTaskToProject()
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: {
      text: '',
      projectId: defaultProjectId || '',
    },
    onSubmit: async ({ value }) => {
      createTask.mutate(
        { text: value.text },
        {
          onSuccess: (newTask) => {
            // If a project was selected, add the task to that project
            if (value.projectId) {
              addTaskToProject.mutate(
                {
                  taskId: newTask.id,
                  projectId: value.projectId,
                },
                {
                  // Reset form only after both operations complete
                  onSuccess: () => {
                    form.reset()
                    onOpenChange(false)
                  },
                }
              )
            } else {
              // Reset immediately if no project association
              form.reset()
              onOpenChange(false)
            }
          },
        }
      )
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
                name="text"
                validators={{
                  onSubmit: ({ value }) => (!value ? 'Task title cannot be empty' : null),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="text">Title</Label>
                    <Input
                      id="text"
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
                        onValueChange={field.handleChange}
                        placeholder="Select project"
                        emptyMessage="No project found."
                        searchPlaceholder="Search project..."
                      />
                    </>
                  )}
                </form.Field>
              </div>
            )}
          </div>

          <DialogFooter>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon />}
                  Add Task
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddTaskForm }
