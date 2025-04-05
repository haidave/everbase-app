import { Button } from '@/components/ui/button'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { type Project } from '@/db/schema'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useToggleProjectStarred } from '@/hooks/use-projects'

type ProjectKanbanItemProps = {
  project: Project
  isDragging?: boolean
}

export function ProjectKanbanItem({ project, isDragging = false }: ProjectKanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: project.id,
    data: {
      type: 'project',
      project,
    },
  })

  const toggleStarred = useToggleProjectStarred()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    toggleStarred.mutate({ id: project.id, starred: !project.starred })
  }

  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DynamicIcon name={project.icon} className="size-4" />
          <p className="text-sm">{project.name}</p>
        </div>
        <Button variant="ghost" size="icon" type="button" onClick={handleToggleStar}>
          {project.starred ? <Star className="fill-current" /> : <Star />}
        </Button>
      </div>
    </Link>
  )
}
