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
import { type Habit } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useCreateHabit, useDeleteHabit, useUpdateHabit } from '@/hooks/use-habits'

type AddHabitFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit
}

export function AddHabitForm({ open, onOpenChange, habit }: AddHabitFormProps) {
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
  const deleteHabit = useDeleteHabit()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isEditing = !!habit
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: {
      name: habit?.name || '',
      description: habit?.description || '',
    },
    onSubmit: async ({ value }) => {
      if (isEditing && habit) {
        updateHabit.mutate(
          {
            id: habit.id,
            name: value.name,
            description: value.description,
          },
          {
            onSuccess: () => {
              toast.success(`Habit "${value.name}" was updated.`)
              form.reset()
              onOpenChange(false)
            },
          }
        )
      } else {
        createHabit.mutate(
          {
            name: value.name,
            description: value.description,
            active: true,
          },
          {
            onSuccess: () => {
              toast.success(`Habit "${value.name}" was added.`)
              form.reset()
              onOpenChange(false)
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

  const handleDelete = () => {
    if (habit) {
      deleteHabit.mutate(habit.id, {
        onSuccess: () => {
          toast.success(`Habit "${habit.name}" was deleted.`)
          setIsDeleteDialogOpen(false)
          onOpenChange(false)
        },
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edit your habit details below.'
                : 'Add a new habit to track. What would you like to build consistency with?'}
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
                      placeholder="e.g., Morning Meditation"
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
                    <Label htmlFor="description">Description (optional)</Label>
                    <TextareaAutosize
                      id="description"
                      placeholder="Add some details about this habit..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </>
                )}
              </form.Field>
            </div>

            <DialogFooter className={cn(isEditing && 'justify-between gap-2')}>
              {isEditing && (
                <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Habit
                </Button>
              )}
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : isEditing ? (
                      <SaveIcon />
                    ) : (
                      <PlusIcon />
                    )}
                    {isEditing ? 'Save Changes' : 'Create Habit'}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Are you sure?"
        description={`This will permanently delete the habit "${habit?.name}" and all its completion history.`}
        onConfirm={handleDelete}
        isLoading={deleteHabit.isPending}
      />
    </>
  )
}
