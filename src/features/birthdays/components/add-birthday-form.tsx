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
import { TextareaAutosize } from '@/components/ui/textarea'
import { type Birthday } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'

import { useCreateBirthday, useUpdateBirthday } from '@/hooks/use-birthdays'

type AddBirthdayFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  birthday?: Birthday
}

export function AddBirthdayForm({ open, onOpenChange, birthday }: AddBirthdayFormProps) {
  const createBirthday = useCreateBirthday()
  const updateBirthday = useUpdateBirthday()
  const isEditing = !!birthday

  const form = useForm({
    defaultValues: {
      name: birthday?.name || '',
      birthDate: birthday ? new Date(birthday.birthDate) : new Date(),
      description: birthday?.description || '',
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) return

      if (isEditing && birthday) {
        updateBirthday.mutate(
          {
            id: birthday.id,
            name: value.name,
            birthDate: value.birthDate,
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
        createBirthday.mutate(
          {
            name: value.name,
            birthDate: value.birthDate,
            description: value.description,
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

  const isPending = isEditing ? updateBirthday.isPending : createBirthday.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Birthday' : 'Add Birthday'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update birthday details.' : 'Add a new birthday to remember.'}
          </DialogDescription>
        </DialogHeader>

        <form
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
                    placeholder="Person's name"
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
            <form.Field name="birthDate">
              {(field) => (
                <>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={format(field.state.value, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date()
                      field.handleChange(date)
                    }}
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
                  <Label htmlFor="description">Notes (optional)</Label>
                  <TextareaAutosize
                    id="description"
                    placeholder="Add some notes..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    minRows={3}
                  />
                </>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircleIcon className="animate-spin" /> : isEditing ? <SaveIcon /> : <PlusIcon />}
              {isEditing ? 'Save Changes' : 'Add Birthday'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
