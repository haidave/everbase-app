import { useRef } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { type Habit } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCreateHabit, useUpdateHabit } from '@/hooks/use-habits'

type AddHabitFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit
}

export function AddHabitForm({ open, onOpenChange, habit }: AddHabitFormProps) {
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
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

  return (
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
                  <Textarea
                    id="description"
                    placeholder="Add some details about this habit..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    rows={3}
                  />
                </>
              )}
            </form.Field>
          </div>

          <DialogFooter>
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
  )
}
