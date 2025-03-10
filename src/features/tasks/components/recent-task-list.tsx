import { useTasks } from '@/hooks/use-tasks'

import { TaskItem } from './task-item'

type RecentTaskListProps = {
  limit?: number
}

const RecentTaskList = ({ limit = 5 }: RecentTaskListProps) => {
  const { data: tasks, isLoading, error } = useTasks()

  if (isLoading) return <div className="p-4">Loading tasks...</div>
  if (error) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  if (!tasks?.length) return <p>No tasks yet.</p>

  // Filter out completed tasks, then sort by creation date (newest first)
  const recentTasks = [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  if (!recentTasks.length) return <p>No incomplete tasks.</p>

  return (
    <ul className="space-y-2">
      {recentTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export { RecentTaskList }
