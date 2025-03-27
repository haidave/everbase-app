import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Event } from '@/db/schema'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'

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
      <div className="group flex items-center justify-between gap-2">
        <div className="grid gap-1">
          <p className="text-muted-foreground text-sm">{format(eventDate, 'do')}</p>
          <p className="font-medium">
            {event.title}
            {event.description && <span className="text-muted-foreground ml-2 text-xs">({event.description})</span>}
          </p>
        </div>
        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(event)}>
            <Trash2 />
          </Button>
        </div>
      </div>

      <AddEventForm open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} event={event} />
    </>
  )
}
