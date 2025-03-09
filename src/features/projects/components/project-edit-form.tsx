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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, LoaderCircleIcon } from 'lucide-react'

import { useDeleteProject, useUpdateProject } from '@/hooks/use-projects'
import { useGetTasksByProject } from '@/hooks/use-tasks'

type ProjectEditFormProps = {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectEditForm({ project, open, onOpenChange }: ProjectEditFormProps) {
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch tasks related to this project directly with the hook
  const { data: relatedTasks, isLoading } = useGetTasksByProject(project.id)

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription className="sr-only">Edit the name and status of the project.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-1 flex-col gap-6"
        >
          <div className="flex flex-col gap-6">
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

          {/* Related Tasks Section */}
          <div className="mt-6">
            <h3 className="mb-2 font-medium">Related Tasks</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoaderCircleIcon className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : relatedTasks && relatedTasks.length > 0 ? (
              <div className="max-h-40 overflow-y-auto rounded-md border">
                <ul className="divide-y">
                  {relatedTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between p-2 text-sm">
                      <span className="truncate">{task.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No tasks associated with this project.</p>
            )}
          </div>

          <SheetFooter className="mt-auto flex flex-row justify-between sm:justify-between">
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
                    {deleteProject.isPending ? (
                      <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="mr-2 h-4 w-4" />
                    )}
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
                // Calculate hasChanges inside the Subscribe component
                const hasChanges = values.name !== project.name || values.status !== project.status

                return (
                  <Button type="submit" disabled={!canSubmit || !hasChanges || isSubmitting}>
                    {isSubmitting ? <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save changes
                  </Button>
                )
              }}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
