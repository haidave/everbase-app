import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
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
    <section className="relative grid gap-6">
      <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
        <PlusIcon />
        Add Task
      </Button>

      <TaskList />

      <AddTaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </section>
  )
}
