import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ProjectStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'

import { useCreateProject } from '@/hooks/use-projects'

const ProjectForm = () => {
  const createProject = useCreateProject()

  const form = useForm({
    defaultValues: {
      name: '',
      status: 'backlog' as ProjectStatus,
    },
    onSubmit: async ({ value }) => {
      createProject.mutate(
        { name: value.name, status: value.status },
        {
          onSuccess: () => {
            form.reset()
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
            name="name"
            validators={{
              onSubmit: ({ value }) => (!value ? 'Project name cannot be empty' : null),
            }}
          >
            {(field) => (
              <>
                <Label>Name</Label>
                <Input
                  placeholder="Add new project"
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

        <div className="flex flex-1 flex-col gap-2">
          <form.Field name="status">
            {(field) => (
              <>
                <Label>Status</Label>
                <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as ProjectStatus)}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="passive">Passive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button variant="secondary" type="submit" disabled={!canSubmit}>
              {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon className="mr-2" />}
              Add Project
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export { ProjectForm }
