import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useForm } from '@tanstack/react-form'
import { Check, ChevronsUpDown, LoaderCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAddTaskToProject, useProjects } from '@/hooks/use-projects'
import { useCreateTask } from '@/hooks/use-tasks'

type AddTaskFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AddTaskForm = ({ open, onOpenChange }: AddTaskFormProps) => {
  const createTask = useCreateTask()
  const { data: projects } = useProjects()
  const addTaskToProject = useAddTaskToProject()
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      text: '',
      projectId: '',
    },
    onSubmit: async ({ value }) => {
      createTask.mutate(
        { text: value.text },
        {
          onSuccess: (newTask) => {
            // If a project was selected, add the task to that project
            if (value.projectId) {
              addTaskToProject.mutate(
                {
                  taskId: newTask.id,
                  projectId: value.projectId,
                },
                {
                  // Reset form only after both operations complete
                  onSuccess: () => {
                    form.reset()
                    onOpenChange(false)
                  },
                }
              )
            } else {
              // Reset immediately if no project association
              form.reset()
              onOpenChange(false)
            }
          },
        }
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Add a new task to your list. Fill out the details below.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <form.Field
                name="text"
                validators={{
                  onSubmit: ({ value }) => (!value ? 'Task title cannot be empty' : null),
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="text">Title</Label>
                    <Input
                      id="text"
                      placeholder="Task title"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors?.length}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <em role="alert" className="text-destructive text-sm">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>

            {projects && projects.length > 0 && (
              <div className="grid gap-2">
                <form.Field name="projectId">
                  {(field) => (
                    <>
                      <Label htmlFor="projectId">Project (optional)</Label>
                      <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={projectPopoverOpen}
                            className="w-full justify-between"
                          >
                            {field.state.value
                              ? projects.find((project) => project.id === field.state.value)?.name
                              : 'Select project'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0"
                          sideOffset={5}
                          style={{ width: 'var(--radix-popover-trigger-width)' }}
                        >
                          <Command>
                            <CommandInput placeholder="Search project..." />
                            <CommandList>
                              <CommandEmpty>No project found.</CommandEmpty>
                              <CommandGroup>
                                {projects.map((project) => (
                                  <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => {
                                      field.handleChange(project.id)
                                      setProjectPopoverOpen(false)
                                    }}
                                  >
                                    {project.name}
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        project.id === field.state.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
                </form.Field>
              </div>
            )}
          </div>

          <DialogFooter>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : 'Add Task'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddTaskForm }
