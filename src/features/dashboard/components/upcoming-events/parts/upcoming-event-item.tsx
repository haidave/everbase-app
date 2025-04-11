import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddBirthdayForm } from '@/features/birthdays/components/add-birthday-form'
import { AddEventForm } from '@/features/events/components/add-event-form'
import { format, isToday, isTomorrow } from 'date-fns'
import { CakeIcon, CalendarIcon } from 'lucide-react'

import { useBirthday } from '@/hooks/use-birthdays'
import { useEvent } from '@/hooks/use-events'

import { type UpcomingItem } from '../lib/utils'

type UpcomingEventItemProps = {
  item: UpcomingItem
}

export function UpcomingEventItem({ item }: UpcomingEventItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: birthday } = useBirthday(item.type === 'birthday' ? item.id : '')
  const { data: event } = useEvent(item.type === 'event' ? item.id : '')

  // Format the date label
  let dateLabel: string
  if (isToday(item.date)) {
    dateLabel = 'Today'
  } else if (isTomorrow(item.date)) {
    dateLabel = 'Tomorrow'
  } else {
    dateLabel = format(item.date, 'MMM d')
  }

  return (
    <>
      <li className="flex min-w-0 items-center justify-between">
        <Button
          variant="ghost"
          className="-mx-2 flex h-auto w-[calc(100%+2rem)] min-w-0 items-center justify-between px-2 py-1"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="flex min-w-0 items-center gap-2 text-sm">
            {item.type === 'birthday' ? (
              <CakeIcon className="text-muted-foreground size-4 shrink-0" />
            ) : (
              <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
            )}
            <div>
              <span className="min-w-0 truncate">{item.title}</span>
              {item.description ? (
                <span className="text-muted-foreground ml-1 min-w-0 truncate text-xs">({item.description})</span>
              ) : null}
            </div>
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">{dateLabel}</span>
        </Button>
      </li>

      {/* Render the appropriate form based on item type */}
      {item.type === 'birthday' && birthday && (
        <AddBirthdayForm open={isDialogOpen} onOpenChange={setIsDialogOpen} birthday={birthday} />
      )}

      {item.type === 'event' && event && (
        <AddEventForm open={isDialogOpen} onOpenChange={setIsDialogOpen} event={event} />
      )}
    </>
  )
}
