import { useMemo } from 'react'
import { type Project } from '@/db/schema'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'

import { ProjectKanbanItem } from './project-kanban-item'

type ProjectKanbanColumnProps = {
  id: string
  title: string
  projects: Project[]
  isActive?: boolean
}

export function ProjectKanbanColumn({ id, title, projects, isActive = false }: ProjectKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Get all project IDs in this column
  const projectIds = useMemo(() => projects.map((project) => project.id), [projects])

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
        <span className="bg-secondary text-muted-foreground grid size-6 place-items-center rounded-full text-xs">
          {projects.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectKanbanItem key={project.id} project={project} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
