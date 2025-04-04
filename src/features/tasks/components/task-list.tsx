import { type Task } from '@/lib/api'
import { useTasks } from '@/hooks/use-tasks'

import { TaskItem } from './task-item'

type TaskListProps = {
  tasks?: Task[]
}

const TaskList = ({ tasks: propTasks }: TaskListProps) => {
  const { data: fetchedTasks, isLoading, error } = useTasks()

  // Use provided tasks or fetched tasks
  const tasks = propTasks || fetchedTasks

  if (isLoading && !propTasks) return <div className="p-4">Loading tasks...</div>
  if (error && !propTasks) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  if (!tasks?.length) return <p>No tasks yet.</p>

  // Sort tasks: non-done tasks first (newest first), then done tasks by updatedAt (newest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    // First, separate done from non-done
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1

    // If both are non-done, sort by createdAt in descending order (newest first)
    if (a.status !== 'done' && b.status !== 'done') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    // If both are done, sort by updatedAt in descending order (newest completed first)
    if (a.status === 'done' && b.status === 'done') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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
