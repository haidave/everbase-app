import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
import { TaskKanbanFilters } from '@/features/tasks/components/task-kanban-board/parts/task-kanban-filters'
import { TaskKanbanBoard } from '@/features/tasks/components/task-kanban-board/task-kanban-board'
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
      <div className="flex items-center gap-4">
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
          <PlusIcon />
          Add Task
        </Button>

        <TaskKanbanFilters />
      </div>

      <TaskKanbanBoard />

      <AddTaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </section>
  )
}
