import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { useTasks } from '@/hooks/use-tasks'

import { AddTaskForm } from './add-task-form'
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

  // Filter out done tasks, then sort by creation date (newest first)
  const recentTasks = [...tasks]
    .filter((task) => task.status !== 'done')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  if (!recentTasks.length) return <p>No incomplete tasks.</p>

  return (
    <>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground-primary text-sm">Recent Tasks</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon />
            Add Task
          </Button>
        </div>

        <ul className="space-y-2">
          {recentTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>

        <Button variant="link" asChild className="justify-self-center">
          <Link to="/tasks">View all tasks</Link>
        </Button>
      </div>

      <AddTaskForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}

export { RecentTaskList }
