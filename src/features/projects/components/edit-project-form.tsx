import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
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
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useDeleteProject, useUpdateProject } from '@/hooks/use-projects'

type EditProjectFormProps = {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectForm({ project, open, onOpenChange }: EditProjectFormProps) {
  const navigate = useNavigate()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status as ProjectStatus,
      icon: project.icon || 'Folder',
    },
    onSubmit: async ({ value }) => {
      try {
        await updateProject.mutateAsync({
          id: project.id,
          name: value.name,
          description: value.description,
          status: value.status,
          icon: value.icon,
        })

        onOpenChange(false)
        toast.success(`Project "${value.name}" was updated.`)
      } catch (error) {
        console.error('Error updating project:', error)
        toast.error('Failed to update project.')
      }
    },
  })

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        onOpenChange(false)
        navigate({ to: '/projects' })
        toast.success(`Project "${project.name}" was deleted.`)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Make changes to your project here.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Project name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <TextareaAutosize
                    id="description"
                    placeholder="Describe this project"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
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

            <form.Field name="icon">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <IconPicker value={field.state.value} onChange={field.handleChange} />
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter className="justify-between gap-2">
            <Button variant="destructive" type="button" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete Project
            </Button>
            <Button type="submit" disabled={updateProject.isPending} onClick={form.handleSubmit}>
              {updateProject.isPending ? <LoaderCircleIcon className="animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteProject.isPending}
      />
    </Dialog>
  )
}
