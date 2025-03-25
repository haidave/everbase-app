import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type Event } from '@/db/schema'
import { PlusIcon } from 'lucide-react'

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

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Event
      </Button>

      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <EventListItem key={event.id} event={event} onDelete={handleDeleteEvent} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center">No events yet.</p>
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
