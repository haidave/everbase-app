import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '@/hooks/use-tasks'

export const Route = createFileRoute('/tasks')({
  component: Tasks,
})

function Tasks() {
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Use the custom hooks
  const { data: tasks, isLoading, error } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    createTask.mutate(
      {
        title: newTaskTitle,
        description: null,
      },
      {
        onSuccess: () => {
          setNewTaskTitle('')
        },
      }
    )
  }

  // Toggle task completion
  const toggleTaskCompletion = (id: string, currentStatus: string) => {
    updateTask.mutate({
      id,
      completed: currentStatus === 'true' ? 'false' : 'true',
    })
  }

  // Delete a task
  const handleDeleteTask = (id: string) => {
    deleteTask.mutate(id)
  }

  if (isLoading) return <div className="p-4">Loading tasks...</div>
  if (error) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Your Tasks</h1>

      {/* Create task form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2"
          />
          <button
            type="submit"
            disabled={createTask.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {createTask.isPending ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>

      {/* Task list */}
      {tasks?.length === 0 ? (
        <p>No tasks yet. Create your first task!</p>
      ) : (
        <ul className="space-y-2">
          {tasks?.map((task) => (
            <li key={task.id} className="rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed === 'true'}
                    onChange={() => toggleTaskCompletion(task.id, task.completed ?? 'false')}
                    className="h-5 w-5 rounded border-zinc-600"
                  />
                  <div className={task.completed === 'true' ? 'text-zinc-400 line-through' : ''}>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && <p className="text-zinc-400">{task.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="rounded px-2 py-1 text-sm text-red-400 hover:bg-zinc-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
