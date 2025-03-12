import { TaskForm } from '@/features/tasks/components/task-form'
import { TaskList } from '@/features/tasks/components/task-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tasks')({
  component: TasksPage,
  head: () => ({
    meta: [
      {
        title: 'Tasks',
      },
    ],
  }),
})

function TasksPage() {
  return (
    <div className="flex items-start gap-6 px-2 py-4">
      <section className="bg-card relative w-full max-w-96 gap-6 rounded-lg border p-4">
        <TaskForm />
      </section>
      <section className="bg-card relative flex-1 gap-6 rounded-lg border p-4">
        <TaskList />
      </section>
    </div>
  )
}
