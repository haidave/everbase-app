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
    <div className="grid grid-cols-1 gap-4 px-2 py-4 lg:grid-cols-2 xl:grid-cols-4">
      <section className="bg-card grid break-inside-avoid gap-4 rounded-lg border p-4 lg:col-span-2">
        <h2 className="text-foreground-primary text-sm">Journal</h2>
        <AddJournalForm />
      </section>

      <section className="bg-card break-inside-avoid rounded-lg border p-4">
        <DashboardHabits />
      </section>

      <section className="bg-card break-inside-avoid rounded-lg border p-4">
        <DashboardMonthlyChecklist />
      </section>

      <section className="bg-card break-inside-avoid rounded-lg border p-4 lg:col-span-4">
        <RecentTaskList limit={5} />
      </section>
    </div>
  )
}
