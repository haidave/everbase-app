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
import { TextareaAutosize } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon } from 'lucide-react'

import { type Feature } from '@/lib/api'
import { useDeleteFeature, useUpdateFeature } from '@/hooks/use-features'

type EditFeatureFormProps = {
  feature: Feature
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditFeatureForm({ feature, open, onOpenChange }: EditFeatureFormProps) {
  const updateFeature = useUpdateFeature()
  const deleteFeature = useDeleteFeature()
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      name: feature.name,
      description: feature.description || '',
      icon: feature.icon,
    },
    onSubmit: async ({ value }) => {
      updateFeature.mutate(
        {
          id: feature.id,
          name: value.name,
          description: value.description,
          icon: value.icon,
          projectId: feature.projectId,
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
    deleteFeature.mutate(
      {
        id: feature.id,
        projectId: feature.projectId,
      },
      {
        onSuccess: () => {
          navigate({ to: '/projects/$projectId', params: { projectId: feature.projectId } })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Feature</DialogTitle>
          <DialogDescription>Update feature details or delete it.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <form.Field name="name">
              {(field) => (
                <>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Feature name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <TextareaAutosize
                    id="description"
                    placeholder="Describe this feature"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            </form.Field>

            <form.Field name="icon">
              {(field) => (
                <>
                  <Label htmlFor="icon">Icon</Label>
                  <IconPicker value={field.state.value} onChange={field.handleChange} />
                </>
              )}
            </form.Field>
          </div>

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
                  Save Changes
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Feature"
        description="Are you sure you want to delete this feature? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteFeature.isPending}
      />
    </Dialog>
  )
}
