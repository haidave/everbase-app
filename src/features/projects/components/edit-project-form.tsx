import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
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
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, LoaderCircleIcon } from 'lucide-react'

import { useDeleteProject, useUpdateProject } from '@/hooks/use-projects'

type EditProjectFormProps = {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectForm({ project, open, onOpenChange }: EditProjectFormProps) {
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      name: project.name,
      status: project.status as ProjectStatus,
    },
    onSubmit: async ({ value }) => {
      updateProject.mutate(
        {
          id: project.id,
          name: value.name,
          status: value.status,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    },
  })

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Edit the name and status of the project.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="grid gap-4">
            <form.Field
              name="name"
              validators={{
                onSubmit: ({ value }) => (!value ? 'Project name cannot be empty' : null),
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!field.state.meta.errors?.length}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="status">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as ProjectStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button">
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project and remove all associated
                    task connections.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    {deleteProject.isPending ? <LoaderCircleIcon className="animate-spin" /> : <AlertCircle />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
                values: state.values,
              })}
            >
              {({ canSubmit, isSubmitting, values }) => {
                const hasChanges = values.name !== project.name || values.status !== project.status

                return (
                  <Button type="submit" disabled={!canSubmit || !hasChanges || isSubmitting}>
                    {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
                    Save changes
                  </Button>
                )
              }}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
