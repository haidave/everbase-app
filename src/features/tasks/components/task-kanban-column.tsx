import { type Task } from '@/db/schema'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'

import { TaskKanbanItem } from './task-kanban-item'

type TaskKanbanColumnProps = {
  id: string
  title: string
  tasks: Task[]
  isActive?: boolean
}

export function TaskKanbanColumn({ id, title, tasks, isActive = false }: TaskKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-card flex h-full min-h-36 flex-col overflow-y-auto rounded-lg border p-3 shadow-sm',
        (isOver || isActive) && 'outline'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium capitalize">{title}</h3>
        <span className="text-muted-foreground bg-secondary rounded-full px-2 py-1 text-xs">{tasks.length}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskKanbanItem key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
