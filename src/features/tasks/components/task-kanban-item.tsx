import { type Task } from '@/db/schema'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderIcon, FoldersIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTaskFeatures } from '@/hooks/use-features'
import { useTaskProjects } from '@/hooks/use-task-projects'

type TaskKanbanItemProps = {
  task: Task
  isDragging?: boolean
}

export function TaskKanbanItem({ task, isDragging = false }: TaskKanbanItemProps) {
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

  const isDone = task.status === 'done'

  // Get current project and feature associations
  const { data: taskProjects } = useTaskProjects(task.id)
  const { data: taskFeatures } = useTaskFeatures(task.id)

  const currentProject = taskProjects && taskProjects.length > 0 ? taskProjects[0] : null
  const currentFeature = taskFeatures && taskFeatures.length > 0 ? taskFeatures[0] : null

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-card hover:bg-accent flex cursor-grab flex-col gap-2 rounded-md border p-3 shadow-sm active:cursor-grabbing',
        (isDragging || isSortableDragging) && 'opacity-50'
      )}
    >
      <p className={cn('line-clamp-3 text-sm', isDone && 'text-muted-foreground line-through')}>{task.text}</p>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        {currentProject && (
          <div className="text-muted-foreground flex items-center gap-1">
            <FolderIcon className="size-3" />
            <span>{currentProject.name}</span>
          </div>
        )}

        {currentFeature && (
          <div className="text-muted-foreground flex items-center gap-1">
            <FoldersIcon className="size-3" />
            <span>{currentFeature.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
