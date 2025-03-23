import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{event.title}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(event)}>
                <Trash2 />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{format(new Date(event.date), 'PPP')}</CardDescription>
          {event.description && <p className="mt-2">{event.description}</p>}
        </CardContent>
      </Card>

      <AddEventForm open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} event={event} />
    </>
  )
}
