import { useRef, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TextareaAutosize } from '@/components/ui/textarea'
import { type MonthlyChecklist } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import {
  useCreateMonthlyChecklist,
  useDeleteMonthlyChecklist,
  useUpdateMonthlyChecklist,
} from '@/hooks/use-monthly-checklist'

type AddMonthlyChecklistFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthlyChecklist?: MonthlyChecklist
}

export function AddMonthlyChecklistForm({ open, onOpenChange, monthlyChecklist }: AddMonthlyChecklistFormProps) {
  const createMonthlyChecklist = useCreateMonthlyChecklist()
  const updateMonthlyChecklist = useUpdateMonthlyChecklist()
  const deleteMonthlyChecklist = useDeleteMonthlyChecklist()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isEditing = !!monthlyChecklist
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: {
      name: monthlyChecklist?.name || '',
      description: monthlyChecklist?.description || '',
    },
    onSubmit: async ({ value }) => {
      if (isEditing && monthlyChecklist) {
        updateMonthlyChecklist.mutate(
          {
            id: monthlyChecklist.id,
            name: value.name,
            description: value.description,
          },
          {
            onSuccess: () => {
              form.reset()
              onOpenChange(false)
              toast.success(`Item "${monthlyChecklist.name}" was updated.`)
            },
          }
        )
      } else {
        createMonthlyChecklist.mutate(
          {
            name: value.name,
            description: value.description,
            active: true,
          },
          {
            onSuccess: () => {
              form.reset()
              onOpenChange(false)
              toast.success(`Item "${value.name}" was added.`)
            },
          }
        )
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
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    }
  )

  const isPending = isEditing ? updateMonthlyChecklist.isPending : createMonthlyChecklist.isPending

  const handleDelete = () => {
    if (monthlyChecklist) {
      deleteMonthlyChecklist.mutate(monthlyChecklist.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          onOpenChange(false)
          toast.success(`Item "${monthlyChecklist.name}" was deleted.`)
        },
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edit your monthly checklist item details below.'
                : 'Add a new item to your monthly checklist.'}
            </DialogDescription>
          </DialogHeader>

          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <div className="grid gap-2">
              <form.Field
                name="name"
                validators={{
                  onSubmit: ({ value }) => (!value ? 'Name is required' : undefined),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Pay Rent"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
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
                      placeholder="e.g., Due on the 1st of each month"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </>
                )}
              </form.Field>
            </div>

            <DialogFooter className="flex justify-between">
              {isEditing && (
                <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Item
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending ? <LoaderCircleIcon className="animate-spin" /> : isEditing ? <SaveIcon /> : <PlusIcon />}
                {isEditing ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Are you sure?"
        description={`This will permanently delete the item "${monthlyChecklist?.name}".`}
        onConfirm={handleDelete}
        isLoading={deleteMonthlyChecklist.isPending}
      />
    </>
  )
}
