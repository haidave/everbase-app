import { QuoteList } from '@/features/quotes/components/quote-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/quotes')({
  component: QuotesPage,
  head: () => ({
    meta: [
      {
        title: 'Quotes',
      },
    ],
  }),
})

function QuotesPage() {
  return (
    <section className="relative">
      <QuoteList />
    </section>
  )
}
