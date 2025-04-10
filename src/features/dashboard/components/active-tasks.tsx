import { TaskKanbanItem } from '@/features/tasks/components/task-kanban-board/parts/task-kanban-item'
import { LoaderCircleIcon } from 'lucide-react'

import { useTasks } from '@/hooks/use-tasks'

const ActiveTasks = () => {
  const { data: tasks, isLoading, error } = useTasks()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoaderCircleIcon className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive">Error loading tasks: {error.message}</div>
  }

  const inProgressTasks = tasks?.filter((task) => task.status === 'in_progress') || []

  if (inProgressTasks.length === 0) {
    return <p className="text-muted-foreground text-sm">No active tasks.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-foreground-primary text-sm">Active Tasks</h2>
      <div className="flex flex-col gap-2">
        {inProgressTasks.map((task) => (
          <TaskKanbanItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export { ActiveTasks }
