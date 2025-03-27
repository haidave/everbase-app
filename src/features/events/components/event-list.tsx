import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type Event } from '@/db/schema'
import { format, getMonth } from 'date-fns'
import { CalendarIcon, PlusIcon } from 'lucide-react'

import { useDeleteEvent, useEvents } from '@/hooks/use-events'

import { AddEventForm } from './add-event-form'
import { EventListItem } from './event-list-item'

export function EventList() {
  const { data: events, isLoading } = useEvents()
  const deleteEvent = useDeleteEvent()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  if (isLoading) return <div className="p-4">Loading events...</div>

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent.mutate(eventToDelete.id)
      setEventToDelete(null)
    }
  }

  // Group events by month
  const eventsByMonth = events?.reduce(
    (acc, event) => {
      const month = getMonth(new Date(event.date))
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(event)
      return acc
    },
    {} as Record<number, Event[]>
  )

  // Sort events within each month by date
  Object.values(eventsByMonth || {}).forEach((monthEvents) => {
    monthEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  })

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Event
      </Button>

      {events && events.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 12 }, (_, i) => {
            const monthEvents = eventsByMonth?.[i] || []
            if (monthEvents.length === 0) return null

            // Create a date object for the current month to get its name
            const monthDate = new Date(2024, i, 1)
            const monthName = format(monthDate, 'LLLL')

            return (
              <Card key={monthName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CalendarIcon className="size-5" />
                    {monthName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {monthEvents.map((event) => (
                    <EventListItem key={event.id} event={event} onDelete={handleDeleteEvent} />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-4 p-8">
          <CalendarIcon className="text-muted-foreground size-12" />
          <p className="text-center">No events added yet.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon />
            Add Event
          </Button>
        </Card>
      )}

      <AddEventForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      <ConfirmationDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the event "${eventToDelete?.title}".`}
        onConfirm={confirmDelete}
        isLoading={deleteEvent.isPending}
      />
    </div>
  )
}
