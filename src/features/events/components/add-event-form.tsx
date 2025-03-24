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
import { type Event } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { CalendarIcon, LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'

import { useCreateEvent, useUpdateEvent } from '@/hooks/use-events'

type AddEventFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event
}

export function AddEventForm({ open, onOpenChange, event }: AddEventFormProps) {
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isEditing = !!event

  const form = useForm({
    defaultValues: {
      title: event?.title || '',
      date: event ? new Date(event.date) : new Date(),
      description: event?.description || '',
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim()) return

      if (isEditing && event) {
        updateEvent.mutate(
          {
            id: event.id,
            title: value.title,
            date: value.date,
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
        createEvent.mutate(
          {
            title: value.title,
            date: value.date,
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

  const isPending = isEditing ? updateEvent.isPending : createEvent.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your event details.' : 'Create a new event in your calendar.'}
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
              name="title"
              validators={{
                onSubmit: ({ value }) => (!value ? 'Title is required' : undefined),
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Event title"
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
            <form.Field name="date">
              {(field) => (
                <>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 w-full justify-start px-3 text-left font-normal">
                        <CalendarIcon />
                        {format(field.state.value, 'PPP')}
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
                  <Label htmlFor="description">Description (optional)</Label>
                  <TextareaAutosize
                    id="description"
                    placeholder="Add some details about this event..."
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
              {isEditing ? 'Save Changes' : 'Add Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
