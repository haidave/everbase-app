import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TextareaAutosize } from '@/components/ui/textarea'
import { type Birthday } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { CalendarIcon, LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { cn } from '@/lib/utils'
import { useCreateBirthday, useUpdateBirthday } from '@/hooks/use-birthdays'

type AddBirthdayFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  birthday?: Birthday
  onDelete?: () => void
}

export function AddBirthdayForm({ open, onOpenChange, birthday, onDelete }: AddBirthdayFormProps) {
  const createBirthday = useCreateBirthday()
  const updateBirthday = useUpdateBirthday()
  const isEditing = !!birthday
  const formRef = useRef<HTMLFormElement>(null)

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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.state.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.state.value ? format(field.state.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.state.value}
                        onSelect={(date) => field.handleChange(date || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
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
                  />
                </>
              )}
            </form.Field>
          </div>

          <DialogFooter className={cn(isEditing && 'justify-between gap-2')}>
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete Birthday
              </Button>
            )}
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
