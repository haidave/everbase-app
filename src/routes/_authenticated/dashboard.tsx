import { TaskForm } from '@/features/tasks/components/task-form'
import { TaskList } from '@/features/tasks/components/task-list'
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
    <div className="grid grid-cols-3 px-2 py-4">
      <section className="bg-card relative flex flex-col gap-6 rounded-lg border p-4">
        <h2>Tasks</h2>
        <div className="flex w-full flex-col gap-6">
          <TaskForm />
          <TaskList />
        </div>
      </section>
    </div>
  )
}
