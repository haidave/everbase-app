import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <section className="bg-card relative grid flex-1 gap-6 rounded-lg border p-4">
      <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
        Add Task
      </Button>

      <TaskList />

      <AddTaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </section>
  )
}
