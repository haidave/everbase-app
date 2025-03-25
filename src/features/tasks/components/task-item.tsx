import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextInput } from '@/components/ui/text-input'
import { useForm } from '@tanstack/react-form'
import { FolderIcon, XIcon } from 'lucide-react'

import { type Task } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAddTaskToProject, useProjects, useRemoveTaskFromProject } from '@/hooks/use-projects'
import { useTaskProjects } from '@/hooks/use-task-projects'
import { useDeleteTask, useUpdateTask } from '@/hooks/use-tasks'

type TaskItemProps = {
  task: Task
}

const TaskItem = ({ task }: TaskItemProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const isCompleted = Boolean(task.completed)
  const [showProjectSelect, setShowProjectSelect] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Get projects for dropdown
  const { data: projects } = useProjects()

  // Get current project associations
  const { data: taskProjects } = useTaskProjects(task.id)

  // Project mutations
  const addTaskToProject = useAddTaskToProject()
  const removeTaskFromProject = useRemoveTaskFromProject()

  // Get current project (if any)
  const currentProject = taskProjects && taskProjects.length > 0 ? taskProjects[0] : null

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

  const handleProjectChange = (projectId: string) => {
    // If there's a current project and it's different from the selected one
    if (currentProject && currentProject.id !== projectId) {
      // Use the mutation hook instead of direct API call
      removeTaskFromProject.mutate(
        { taskId: task.id, projectId: currentProject.id },
        {
          // Add the task to the new project once removal is complete
          onSuccess: () => {
            addTaskToProject.mutate(
              { taskId: task.id, projectId },
              {
                onSuccess: () => {
                  setShowProjectSelect(false)
                },
              }
            )
          },
        }
      )
    } else {
      // If there's no current project, just add to the new one
      addTaskToProject.mutate(
        { taskId: task.id, projectId },
        {
          onSuccess: () => {
            setShowProjectSelect(false)
          },
        }
      )
    }
  }

  const confirmDelete = () => {
    deleteTask.mutate(task.id)
    setShowDeleteDialog(false)
  }

  return (
    <li>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => {
              updateTask.mutate({
                id: task.id,
                completed: !isCompleted,
              })
            }}
          />

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
                  className={cn(isCompleted && 'line-through')}
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* Project selection */}
        <div className="ml-left flex items-center">
          {currentProject && !showProjectSelect && (
            <span className="mr-2 hidden text-xs sm:inline-block">{currentProject.name}</span>
          )}

          {showProjectSelect ? (
            <Select
              defaultOpen={true}
              value={currentProject?.id || ''}
              onValueChange={handleProjectChange}
              onOpenChange={(open) => {
                if (!open) {
                  setShowProjectSelect(false)
                }
              }}
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProjectSelect(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Assign to project"
            >
              <FolderIcon />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          aria-label={`Delete task: ${task.text}`}
        >
          <XIcon />
        </Button>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Are you sure?"
        description={`This will permanently delete the task "${task.text}".`}
        onConfirm={confirmDelete}
        isLoading={deleteTask.isPending}
      />
    </li>
  )
}

export { TaskItem }
