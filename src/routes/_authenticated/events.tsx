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
    <section>
      <EventList />
    </section>
  )
}
