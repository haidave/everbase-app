import { useTasks } from '@/hooks/use-tasks'

import { TaskItem } from './task-item'

const TaskList = () => {
  const { data: tasks, isLoading, error } = useTasks()

  if (isLoading) return <div className="p-4">Loading tasks...</div>
  if (error) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  if (!tasks?.length) return <p>No tasks yet.</p>

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export { TaskList }
