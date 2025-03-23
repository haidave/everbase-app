import { AddEventForm } from '@/features/events/components/add-event-form'
import { EventList } from '@/features/events/components/event-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/events')({
  component: EventsPage,
  head: () => ({
    meta: [
      {
        title: 'Events',
      },
    ],
  }),
})

function EventsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Events</h2>
      <AddEventForm open={false} onOpenChange={() => {}} />
      <EventList />
    </section>
  )
}
