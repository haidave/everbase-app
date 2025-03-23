import { useBirthdays } from '@/hooks/use-birthdays'
import { useUpcomingEvents } from '@/hooks/use-events'

import { getFilteredUpcomingItems } from './lib/utils'
import { UpcomingEventItem } from './parts/upcoming-event-item'

const UpcomingEvents = () => {
  const { data: birthdays, isLoading: isLoadingBirthdays } = useBirthdays()
  const { data: events, isLoading: isLoadingEvents } = useUpcomingEvents(365) // Get events for the whole year

  if (isLoadingBirthdays || isLoadingEvents || events === undefined) {
    return <div>Loading upcoming events...</div>
  }

  const filteredItems = getFilteredUpcomingItems(birthdays, events, 30)

  if (!filteredItems.length) {
    return (
      <div className="grid size-full place-items-center">
        <p className="text-muted-foreground text-center text-sm">No upcoming events in the next 30 days</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground-primary text-sm">Upcoming events</h2>
        <span className="text-muted-foreground text-xs">Next 30 days</span>
      </div>

      <ul className="grid gap-2">
        {filteredItems.map((item) => (
          <UpcomingEventItem key={`${item.type}-${item.id}`} item={item} />
        ))}
      </ul>
    </div>
  )
}

export { UpcomingEvents }
