import { SubscriptionList } from '@/features/subscriptions/components/subscription-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/subscriptions')({
  component: SubscriptionsPage,
  head: () => ({
    meta: [
      {
        title: 'Subscriptions',
      },
    ],
  }),
})

function SubscriptionsPage() {
  return (
    <section className="relative">
      <SubscriptionList />
    </section>
  )
}
