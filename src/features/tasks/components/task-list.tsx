import { useTasks } from '@/hooks/use-tasks'

import { TaskItem } from './task-item'

const TaskList = () => {
  const { data: tasks, isLoading, error } = useTasks()

  if (isLoading) return <div className="p-4">Loading tasks...</div>
  if (error) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  if (!tasks?.length) return <p>No tasks yet.</p>

  // Sort tasks: incomplete tasks first, then completed tasks by updated_at
  const sortedTasks = [...tasks].sort((a, b) => {
    // First, separate completed from incomplete
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1

    // If both are completed, sort by updated_at in ascending order
    // This ensures the first checked task is at the bottom, and newer checked tasks appear above it
    // @ts-expect-error - Need to update format
    if (a.completed && b.completed && a.updated_at && b.updated_at) {
      // @ts-expect-error - Need to update format
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    }

    return 0
  })

  return (
    <ul className="space-y-2">
      {sortedTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export { TaskList }
