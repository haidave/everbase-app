import { QuoteOfTheDay } from '@/features/dashboard/components/quote-of-the-day'
import { UpcomingEvents } from '@/features/dashboard/components/upcoming-events/upcoming-events'
import { DashboardHabits } from '@/features/habits/components/dashboard-habits'
import { AddJournalForm } from '@/features/journals/components/add-journal-form'
import { DashboardMonthlyChecklist } from '@/features/monthly-checklist/components/dashboard-monthly-checklist'
import { RecentTaskList } from '@/features/tasks/components/recent-task-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
  head: () => ({
    meta: [
      {
        title: 'Dashboard',
      },
    ],
  }),
})

function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 px-2 lg:grid-cols-2 xl:grid-cols-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <section className="bg-card grid break-inside-avoid gap-4 rounded-lg border p-4">
          <h2 className="text-foreground-primary text-sm">Journal</h2>
          <AddJournalForm isDashboard />
        </section>

        <section className="bg-card break-inside-avoid rounded-lg border p-4">
          <UpcomingEvents />
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <section className="bg-card break-inside-avoid rounded-lg border p-4">
          <DashboardHabits />
        </section>

        <section className="bg-card break-inside-avoid rounded-lg border p-4">
          <DashboardMonthlyChecklist />
        </section>
      </div>

      <section className="bg-card break-inside-avoid rounded-lg border p-4 lg:col-span-3">
        <RecentTaskList limit={5} />
      </section>

      <section className="bg-card break-inside-avoid rounded-lg border p-4 lg:col-span-1">
        <QuoteOfTheDay />
      </section>
    </div>
  )
}
