import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { type Project } from '@/db/schema'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from '@tanstack/react-router'
import { Pencil, Star, StarOff, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useDeleteProject, useToggleProjectStarred } from '@/hooks/use-projects'

import { EditProjectForm } from '../../edit-project-form'

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

  const deleteProject = useDeleteProject()
  const toggleStarred = useToggleProjectStarred()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = () => {
    deleteProject.mutate(project.id)
    setIsDeleteDialogOpen(false)
  }

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStarred.mutate({ id: project.id, starred: !project.starred })
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
              'bg-card hover:bg-accent flex cursor-grab flex-col rounded-md border p-3 shadow-sm active:cursor-grabbing',
              (isDragging || isSortableDragging) && 'opacity-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DynamicIcon name={project.icon} className="size-4" />
                <p className="font-medium">{project.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleToggleStar}>
                {project.starred ? <Star className="fill-current" /> : <Star />}
              </Button>
            </div>

            <div className="mt-2 flex justify-end">
              <Link
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                className="text-primary text-xs hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={handleToggleStar}>
            {project.starred ? (
              <>
                <StarOff className="mr-2 size-4" />
                Unstar
              </>
            ) : (
              <>
                <Star className="mr-2 size-4" />
                Star
              </>
            )}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditProjectForm project={project} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteProject.isPending}
      />
    </>
  )
}
