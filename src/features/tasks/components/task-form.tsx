import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'

import { useAddTaskToProject, useProjects } from '@/hooks/use-projects'
import { useCreateTask } from '@/hooks/use-tasks'

const TaskForm = () => {
  const createTask = useCreateTask()
  const { data: projects } = useProjects()
  const addTaskToProject = useAddTaskToProject()

  const form = useForm({
    defaultValues: {
      text: '',
      projectId: '',
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
                  onSuccess: () => form.reset(),
                }
              )
            } else {
              // Reset immediately if no project association
              form.reset()
            }
          },
        }
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <form.Field
            name="text"
            validators={{
              onSubmit: ({ value }) => (!value ? 'Cannot be empty' : null),
            }}
          >
            {(field) => (
              <>
                <Label>Title</Label>
                <Input
                  placeholder="Add new task"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={!!field.state.meta.errors?.length}
                  className="bg-card"
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
          <div className="flex flex-1 flex-col gap-2">
            <form.Field name="projectId">
              {(field) => (
                <>
                  <Label>Project (optional)</Label>
                  <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </form.Field>
          </div>
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button variant="secondary" type="submit" disabled={!canSubmit}>
              {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon className="mr-2" />}
              Add Task
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export { TaskForm }
