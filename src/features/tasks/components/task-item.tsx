import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TextInput } from '@/components/ui/text-input'
import { useForm } from '@tanstack/react-form'
import { XIcon } from 'lucide-react'

import { type Task } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useDeleteTask, useUpdateTask } from '@/hooks/use-tasks'

type TaskItemProps = {
  task: Task
}

const TaskItem = ({ task }: TaskItemProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const isCompleted = Boolean(task.completed)

  // Toggle task completion
  const toggleCompletion = () => {
    updateTask.mutate({
      id: task.id,
      completed: !isCompleted,
    })
  }

  const form = useForm({
    defaultValues: {
      text: task.text,
    },
    onSubmit: async ({ value }) => {
      // Skip for completed tasks or unchanged text
      if (isCompleted || value.text.trim() === task.text) {
        inputRef.current?.blur()
        return
      }

      // Handle empty input
      if (!value.text.trim()) {
        form.reset()
        inputRef.current?.blur()
        return
      }

      // Update task text
      updateTask.mutate({ id: task.id, text: value.text }, { onSuccess: () => inputRef.current?.blur() })
    },
  })

  return (
    <li>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Checkbox checked={isCompleted} onCheckedChange={toggleCompletion} />

          <div className="flex flex-1">
            <form.Field name="text">
              {(field) => (
                <TextInput
                  ref={inputRef}
                  value={field.state.value}
                  onChange={(e) => {
                    if (!isCompleted) {
                      field.handleChange(e.target.value)
                    }
                  }}
                  onBlur={() => {
                    field.handleBlur()
                    if (!isCompleted) {
                      form.handleSubmit()
                    }
                  }}
                  onClick={() => {
                    if (!isCompleted) {
                      setTimeout(() => inputRef.current?.focus(), 0)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (isCompleted) return

                    if (e.key === 'Enter') {
                      e.preventDefault()
                      form.handleSubmit()
                    } else if (e.key === 'Escape') {
                      if (field.state.value.trim() === '') {
                        form.reset()
                      }
                      inputRef.current?.blur()
                    }
                  }}
                  readOnly={isCompleted}
                  disabled={isCompleted}
                  aria-label={`${isCompleted ? 'View' : 'Edit'} task: ${task.text}`}
                  className={cn(isCompleted && 'line-through', 'bg-card')}
                />
              )}
            </form.Field>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteTask.mutate(task.id)}
          aria-label={`Delete task: ${task.text}`}
        >
          <XIcon />
        </Button>
      </div>
    </li>
  )
}

export { TaskItem }
