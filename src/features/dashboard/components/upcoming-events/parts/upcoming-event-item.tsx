import { format, isToday, isTomorrow } from 'date-fns'
import { CakeIcon, CalendarIcon } from 'lucide-react'

import { type UpcomingItem } from '../lib/utils'

type UpcomingEventItemProps = {
  item: UpcomingItem
}

export function UpcomingEventItem({ item }: UpcomingEventItemProps) {
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
    <li className="flex min-w-0 items-center justify-between gap-4">
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
    </li>
  )
}
