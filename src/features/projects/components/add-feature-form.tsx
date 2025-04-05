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
import { TextareaAutosize } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'

import { useCreateFeature } from '@/hooks/use-features'

type AddFeatureFormProps = {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFeatureForm({ projectId, open, onOpenChange }: AddFeatureFormProps) {
  const createFeature = useCreateFeature()

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      icon: 'Folders',
    },
    onSubmit: async ({ value }) => {
      try {
        await createFeature.mutateAsync({
          projectId,
          name: value.name,
          description: value.description,
          icon: value.icon,
        })
        form.reset()
        onOpenChange(false)
      } catch (error) {
        console.error('Error creating feature:', error)
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Feature</DialogTitle>
          <DialogDescription>Create a new feature for your project.</DialogDescription>
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
                    required
                  />
                </>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <TextareaAutosize
                    minRows={3}
                    maxRows={10}
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

          <DialogFooter>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, createFeature.isPending]}>
              {([canSubmit, isSubmitting, isPending]) => (
                <Button type="submit" disabled={!canSubmit || isPending}>
                  {isSubmitting || isPending ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon />}
                  Add Feature
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
