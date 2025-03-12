import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TaskForm } from '@/features/tasks/components/task-form'
import { TaskList } from '@/features/tasks/components/task-list'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <section className="bg-card relative grid flex-1 gap-6 rounded-lg border p-4">
      <Button variant="secondary" size="sm" onClick={() => setIsAddDialogOpen(true)} className="w-fit">
        <PlusIcon className="mr-2 h-4 w-4" /> Add Task
      </Button>

      <TaskList />

      <TaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </section>
  )
}
