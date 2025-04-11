import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { type Task } from '@/db/schema'
import { useTaskFiltersStore } from '@/store/use-task-filters-store'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderIcon, FoldersIcon, Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useTaskFeatures } from '@/hooks/use-features'
import { useTaskProjects } from '@/hooks/use-task-projects'
import { useDeleteTask } from '@/hooks/use-tasks'

import { EditTaskForm } from '../../edit-task-form'

interface TaskKanbanItemProps {
  task: Task
  isDragging?: boolean
  isDashboard?: boolean
}

export function TaskKanbanItem({ task, isDragging = false, isDashboard = false }: TaskKanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  })
  const { groupByProject } = useTaskFiltersStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const deleteTask = useDeleteTask()

  const isDone = task.status === 'done'

  // Get current project and feature associations
  const { data: taskProjects, isLoading: isLoadingProjects } = useTaskProjects(task.id)
  const { data: taskFeatures, isLoading: isLoadingFeatures } = useTaskFeatures(task.id)

  const currentProject = taskProjects && taskProjects.length > 0 ? taskProjects[0] : null
  const currentFeature = taskFeatures && taskFeatures.length > 0 ? taskFeatures[0] : null

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        toast.success(`Task "${task.title}" was deleted.`)
      },
    })
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            type="button"
            onClick={() => setIsEditDialogOpen(true)}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
              'bg-card hover:bg-accent flex w-full flex-col rounded-md border p-3 shadow-sm',
              isDragging ? 'cursor-grabbing' : 'cursor-pointer',
              (isDragging || isSortableDragging) && 'opacity-50'
            )}
          >
            <p className={cn('line-clamp-3 text-left text-sm', isDone && 'text-muted-foreground line-through')}>
              {task.title}
            </p>

            <div
              className={cn(
                'flex flex-wrap items-center gap-2 text-xs',
                (currentProject && (isDashboard || !groupByProject)) || (groupByProject && currentFeature) ? 'mt-2' : ''
              )}
            >
              {(isDashboard || !groupByProject) && (
                <>
                  {isLoadingProjects ? (
                    <div className="text-muted-foreground flex animate-pulse items-center gap-1">
                      <FolderIcon className="size-3" />
                      <span className="bg-muted h-5.5 w-16 rounded"></span>
                    </div>
                  ) : (
                    currentProject && (
                      <Badge className="text-muted-foreground flex items-center gap-1 font-normal">
                        <FolderIcon className="size-3" />
                        <span>{currentProject.name}</span>
                      </Badge>
                    )
                  )}
                </>
              )}

              {isLoadingFeatures ? (
                <div className="text-muted-foreground flex animate-pulse items-center gap-1">
                  <FoldersIcon className="size-3" />
                  <span className="bg-muted h-5.5 w-16 rounded"></span>
                </div>
              ) : (
                currentFeature && (
                  <Badge className="text-muted-foreground flex items-center gap-1 font-normal">
                    <FoldersIcon className="size-3" />
                    <span>{currentFeature.name}</span>
                  </Badge>
                )
              )}
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
            <Trash className="mr-2 size-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditTaskForm task={task} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteTask.isPending}
      />
    </>
  )
}
