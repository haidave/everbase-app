import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { type Project } from '@/db/schema'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from '@tanstack/react-router'
import { Pencil, Star, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useDeleteProject, useToggleProjectStarred } from '@/hooks/use-projects'

import { EditProjectForm } from '../../edit-project-form'

type ProjectKanbanItemProps = {
  project: Project
  isDragging?: boolean
}

export function ProjectKanbanItem({ project, isDragging = false }: ProjectKanbanItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
  const deleteProject = useDeleteProject()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    toggleStarred.mutate({ id: project.id, starred: !project.starred })
  }

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        toast.success(`Project "${project.name}" was deleted.`)
      },
    })
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
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

      <EditProjectForm project={project} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteProject.isPending}
      />
    </>
  )
}
