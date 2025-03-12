import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { useTasks } from '@/hooks/use-tasks'

import { TaskForm } from './task-form'
import { TaskItem } from './task-item'

type RecentTaskListProps = {
  limit?: number
}

const RecentTaskList = ({ limit = 5 }: RecentTaskListProps) => {
  const { data: tasks, isLoading, error } = useTasks()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

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
    <>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2>Recent Tasks</h2>
          <Button variant="secondary" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>

        <ul className="space-y-2">
          {recentTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>

        <Button variant="link" size="sm" asChild className="justify-self-center">
          <Link to="/tasks">View all tasks</Link>
        </Button>
      </div>

      <TaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}

export { RecentTaskList }
