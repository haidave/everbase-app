import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type Event } from '@/db/schema'
import { format, getMonth, isSameMonth } from 'date-fns'
import { CalendarIcon, PlusIcon } from 'lucide-react'

import { formatDateString } from '@/lib/formatters'
import { useEvents } from '@/hooks/use-events'

import { AddEventForm } from './add-event-form'
import { EventListItem } from './event-list-item'

export function EventList() {
  const { data: events, isLoading } = useEvents()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  if (isLoading) return <div className="p-4">Loading events...</div>

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
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 12 }, (_, i) => {
            const monthEvents = eventsByMonth?.[i] || []
            if (monthEvents.length === 0) return null

            // Create a date object for the current month to get its name
            const currentYear = new Date().getFullYear()
            const monthDate = new Date(currentYear, i, 1)
            const monthName = format(monthDate, 'LLLL')

            // Create a Set of event dates for easier lookup
            const eventDates = new Set(
              monthEvents.map((event) => {
                const eventDate = new Date(event.date)
                return formatDateString(eventDate)
              })
            )

            return (
              <Card key={monthName}>
                <CardHeader>
                  <span className="text-foreground-primary flex items-center gap-2">
                    <CalendarIcon className="size-4" />
                    {monthName}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 xl:flex-row">
                    <div className="w-full md:w-auto">
                      <Calendar
                        mode="default"
                        month={monthDate}
                        selected={undefined}
                        className="rounded-md border"
                        modifiers={{
                          hasEvent: (date) => {
                            const dayStr = formatDateString(date)
                            return eventDates.has(dayStr)
                          },
                          outsideCurrentMonth: (date) => !isSameMonth(date, monthDate),
                        }}
                        modifiersClassNames={{
                          hasEvent: 'bg-hover',
                          outsideCurrentMonth: 'text-muted-foreground opacity-50',
                        }}
                        disableNavigation
                      />
                    </div>
                    <div className="flex max-h-[300px] w-full flex-col gap-2 overflow-y-auto">
                      {monthEvents.length > 0 ? (
                        monthEvents.map((event) => <EventListItem key={event.id} event={event} />)
                      ) : (
                        <p className="text-muted-foreground py-4 text-center">No events this month</p>
                      )}
                    </div>
                  </div>
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
    </div>
  )
}
