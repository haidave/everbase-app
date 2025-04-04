import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
import { TaskKanbanBoard } from '@/features/tasks/components/task-kanban-board'
import { TaskList } from '@/features/tasks/components/task-list'
import { createFileRoute } from '@tanstack/react-router'
import { KanbanIcon, ListIcon, PlusIcon } from 'lucide-react'

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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  return (
    <section className="relative grid gap-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
          <PlusIcon />
          Add Task
        </Button>

        <div className="flex gap-2">
          <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} onClick={() => setViewMode('kanban')}>
            <KanbanIcon />
            Kanban
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
            <ListIcon />
            List
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? <TaskKanbanBoard /> : <TaskList />}

      <AddTaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </section>
  )
}
