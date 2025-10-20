import { BudgetTrackerList } from '@/features/budget-tracker/components/budget-tracker-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budget-tracker')({
  component: BudgetTrackerPage,
  head: () => ({
    meta: [
      {
        title: 'Budget Tracker',
      },
    ],
  }),
})

function BudgetTrackerPage() {
  return (
    <section className="relative">
      <BudgetTrackerList />
    </section>
  )
}
