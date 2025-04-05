import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Event } from '@/db/schema'
import { format } from 'date-fns'

import { AddEventForm } from './add-event-form'

type EventListItemProps = {
  event: Event
  onDelete: (event: Event) => void
}

export function EventListItem({ event, onDelete }: EventListItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const eventDate = new Date(event.date)

  return (
    <>
      <Button variant="ghost" onClick={() => setIsEditDialogOpen(true)} className="h-max justify-start">
        <div className="grid gap-1 text-left">
          <p className="text-muted-foreground">{format(eventDate, 'do')}</p>
          <div>
            <span className="text-sm">{event.title}</span>
            {event.description && <span className="text-muted-foreground ml-2 text-xs">({event.description})</span>}
          </div>
        </div>
      </Button>

      <AddEventForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={event}
        onDelete={() => {
          onDelete(event)
          setIsEditDialogOpen(false)
        }}
      />
    </>
  )
}
