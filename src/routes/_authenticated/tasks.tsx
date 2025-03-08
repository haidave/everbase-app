import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Save, X } from 'lucide-react'

import { type Task } from '@/lib/api'
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '@/hooks/use-tasks'

export const Route = createFileRoute('/_authenticated/tasks')({
  component: Tasks,
})

function Tasks() {
  const [newTaskText, setNewTaskText] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Use the custom hooks
  const { data: tasks, isLoading, error } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return

    createTask.mutate(
      { text: newTaskText },
      {
        onSuccess: () => {
          setNewTaskText('')
        },
      }
    )
  }

  // Toggle task completion
  const toggleTaskCompletion = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'true' ? 'false' : 'true'
    console.log(`Toggling task ${id} from ${currentStatus} to ${newStatus}`)

    updateTask.mutate(
      {
        id,
        completed: newStatus,
      },
      {
        onSuccess: (updatedTask) => {
          console.log('Task updated successfully:', updatedTask)
        },
        onError: (error) => {
          console.error('Error updating task:', error)
        },
      }
    )
  }

  // Start editing a task
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditText(task.text)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditText('')
  }

  // Save edited task
  const saveEdit = (id: string) => {
    if (!editText.trim()) return

    updateTask.mutate(
      {
        id,
        text: editText,
      },
      {
        onSuccess: () => {
          setEditingTaskId(null)
          setEditText('')
        },
      }
    )
  }

  // Delete a task
  const handleDeleteTask = (id: string) => {
    deleteTask.mutate(id)
  }

  if (isLoading) return <div className="p-4">Loading tasks...</div>
  if (error) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <p className="mb-6 text-zinc-400">Manage your tasks and track your progress here.</p>

      {/* Create task form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
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
                <div className="flex flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed === 'true'}
                    onChange={() => toggleTaskCompletion(task.id, task.completed ?? 'false')}
                    className="h-5 w-5 rounded border-zinc-600"
                  />

                  {editingTaskId === task.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-700 px-3 py-1"
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="rounded px-2 py-1 text-sm text-green-400 hover:bg-zinc-700"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="rounded px-2 py-1 text-sm text-red-400 hover:bg-zinc-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className={`flex-1 ${task.completed === 'true' ? 'text-zinc-400 line-through' : ''}`}>
                      {task.text}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingTaskId !== task.id && (
                    <button
                      onClick={() => startEditing(task)}
                      className="rounded px-2 py-1 text-sm text-blue-400 hover:bg-zinc-700"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded px-2 py-1 text-sm text-red-400 hover:bg-zinc-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
