import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextInput } from '@/components/ui/text-input'
import { useForm } from '@tanstack/react-form'
import { FolderIcon, FoldersIcon, XIcon } from 'lucide-react'

import { type Task } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAddTaskToFeature, useRemoveTaskFromFeature, useTaskFeatures } from '@/hooks/use-features'
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
  const isDone = task.status === 'done'
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

  // Get current feature associations
  const { data: taskFeatures } = useTaskFeatures(task.id)
  const [showFeatureSelect, setShowFeatureSelect] = useState(false)

  // Feature mutations
  const addTaskToFeature = useAddTaskToFeature()
  const removeTaskFromFeature = useRemoveTaskFromFeature()

  // Get current feature (if any)
  const currentFeature = taskFeatures && taskFeatures.length > 0 ? taskFeatures[0] : null

  const form = useForm({
    defaultValues: {
      text: task.text,
    },
    onSubmit: async ({ value }) => {
      // Skip for completed tasks or unchanged text
      if (isDone || value.text.trim() === task.text) {
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

  const handleFeatureChange = (featureId: string) => {
    // If there's a current feature and it's different from the selected one
    if (currentFeature && currentFeature.id !== featureId) {
      removeTaskFromFeature.mutate(
        { taskId: task.id, featureId: currentFeature.id },
        {
          onSuccess: () => {
            addTaskToFeature.mutate(
              { taskId: task.id, featureId },
              {
                onSuccess: () => {
                  setShowFeatureSelect(false)
                },
              }
            )
          },
        }
      )
    } else {
      // If there's no current feature, just add to the new one
      addTaskToFeature.mutate(
        { taskId: task.id, featureId },
        {
          onSuccess: () => {
            setShowFeatureSelect(false)
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
            checked={isDone}
            onCheckedChange={() => {
              updateTask.mutate({
                id: task.id,
                status: isDone ? 'todo' : 'done',
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
                    if (!isDone) {
                      field.handleChange(e.target.value)
                    }
                  }}
                  onBlur={() => {
                    field.handleBlur()
                    if (!isDone) {
                      form.handleSubmit()
                    }
                  }}
                  onClick={() => {
                    if (!isDone) {
                      setTimeout(() => inputRef.current?.focus(), 0)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (isDone) return

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
                  readOnly={isDone}
                  disabled={isDone}
                  aria-label={`${isDone ? 'View' : 'Edit'} task: ${task.text}`}
                  className={cn(isDone && 'line-through')}
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

        {/* Feature selection - only show if a project is selected */}
        {currentProject && (
          <div className="ml-left flex items-center">
            {currentFeature && !showFeatureSelect && (
              <span className="mr-2 hidden text-xs sm:inline-block">{currentFeature.name}</span>
            )}

            {showFeatureSelect ? (
              <Select
                defaultOpen={true}
                value={currentFeature?.id || ''}
                onValueChange={handleFeatureChange}
                onOpenChange={(open) => {
                  if (!open) {
                    setShowFeatureSelect(false)
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    ?.filter((f) => f.id === currentProject.id)
                    .map((feature) => (
                      <SelectItem key={feature.id} value={feature.id}>
                        {feature.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFeatureSelect(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Assign to feature"
              >
                <FoldersIcon />
              </Button>
            )}
          </div>
        )}

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
