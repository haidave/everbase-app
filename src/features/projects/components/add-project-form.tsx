import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IconPicker } from '@/components/ui/icon-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextareaAutosize } from '@/components/ui/textarea'
import { type ProjectStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useCreateProject } from '@/hooks/use-projects'

type AddProjectFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProjectForm({ open, onOpenChange }: AddProjectFormProps) {
  const createProject = useCreateProject()

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'backlog' as ProjectStatus,
      icon: 'Folder',
    },
    onSubmit: async ({ value }) => {
      createProject.mutate(
        {
          name: value.name,
          description: value.description,
          status: value.status,
          icon: value.icon,
        },
        {
          onSuccess: () => {
            toast.success(`Project "${value.name}" was added.`)
            form.reset()
            onOpenChange(false)
          },
        }
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new project to organize your tasks. Fill out the details below.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <form.Field
                name="name"
                validators={{
                  onSubmit: ({ value }) => (!value ? 'Project name cannot be empty' : null),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Project name"
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
                    <Label htmlFor="description">Description (Optional)</Label>
                    <TextareaAutosize
                      id="description"
                      placeholder="Project description"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </>
                )}
              </form.Field>
            </div>

            <div className="grid gap-2">
              <form.Field name="status">
                {(field) => (
                  <>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as ProjectStatus)}
                    >
                      <SelectTrigger id="status">
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

            <div className="grid gap-2">
              <form.Field name="icon">
                {(field) => (
                  <>
                    <Label htmlFor="icon">Icon</Label>
                    <IconPicker value={field.state.value} onChange={field.handleChange} />
                  </>
                )}
              </form.Field>
            </div>
          </div>

          <DialogFooter>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon />}
                  Create Project
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
