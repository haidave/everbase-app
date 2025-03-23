import { MonthlyChecklistList } from '@/features/monthly-checklist/components/monthly-checklist-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/monthly-checklist')({
  component: MonthlyChecklistPage,
  head: () => ({
    meta: [
      {
        title: 'Monthly Checklist',
      },
    ],
  }),
})

function MonthlyChecklistPage() {
  return (
    <section className="relative">
      <MonthlyChecklistList />
    </section>
  )
}
