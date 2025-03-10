import { ProjectList } from '@/features/projects/components/project-list'
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
    <div className="grid items-start gap-4 px-2 py-4 lg:grid-cols-2">
      <section className="bg-card relative flex flex-col gap-6 rounded-lg border p-4">
        <h2>Recent Tasks</h2>
        <RecentTaskList limit={5} />
      </section>

      <section className="bg-card relative flex flex-col gap-6 rounded-lg border p-4">
        <h2>Projects</h2>
        <ProjectList />
      </section>
    </div>
  )
}
