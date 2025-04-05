import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/db/schema'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { arrayMove } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'

import { useProjects, useUpdateProject } from '@/hooks/use-projects'

import { AddProjectForm } from '../add-project-form'
import { ProjectKanbanColumn } from './parts/project-kanban-column'
import { ProjectKanbanItem } from './parts/project-kanban-item'

type ProjectKanbanBoardProps = {
  projects?: Project[]
}

export function ProjectKanbanBoard({ projects: propProjects }: ProjectKanbanBoardProps) {
  // State for project form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch projects
  const { data: fetchedProjects, isLoading, error } = useProjects()
  const updateProject = useUpdateProject()

  // State for active drag item
  const [activeId, setActiveId] = useState<string | null>(null)

  // Track the current column being dragged over for visual feedback
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  // Local state to track projects
  const [localProjects, setLocalProjects] = useState<Project[]>([])

  // Temporary state for projects during drag operations
  const [tempProjects, setTempProjects] = useState<Project[]>([])

  // Determine which projects to display
  const allProjects = useMemo(() => {
    // If specific projects are provided as props, use those
    if (propProjects) return propProjects

    // Otherwise use all projects
    return fetchedProjects || []
  }, [propProjects, fetchedProjects])

  // Update local projects when allProjects changes
  useEffect(() => {
    setLocalProjects(allProjects)
    setTempProjects(allProjects)
  }, [allProjects])

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const projectsToUse = activeId ? tempProjects : localProjects

    return PROJECT_STATUSES.reduce(
      (acc, status) => {
        acc[status] = projectsToUse
          .filter((project) => project.status === status)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        return acc
      },
      {} as Record<ProjectStatus, Project[]>
    )
  }, [localProjects, tempProjects, activeId])

  if (isLoading && !propProjects) return <div className="p-4">Loading projects...</div>
  if (error && !propProjects) return <div className="p-4 text-red-500">Error loading projects: {error.message}</div>

  if (!localProjects?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p>No projects yet.</p>
        <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          Create your first project
        </Button>
        <AddProjectForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </div>
    )
  }

  // Find the active project
  const activeProject = activeId ? localProjects.find((project) => project.id === activeId) || null : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString())
    // Initialize tempProjects with current localProjects
    setTempProjects(localProjects)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event

    if (!over) {
      setActiveColumn(null)
      return
    }

    const overId = over.id.toString()

    // Always set active column when hovering over a column
    if (overId.startsWith('column-')) {
      setActiveColumn(overId)
      return
    }

    // If hovering over a project, find its column
    const overProject = localProjects.find((p) => p.id === overId)
    if (overProject) {
      setActiveColumn(`column-${overProject.status}`)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Reset active column
    setActiveColumn(null)

    if (!over) {
      setActiveId(null)
      // Reset temp projects
      setTempProjects(localProjects)
      return
    }

    const activeId = active.id.toString()
    const overId = over.id.toString()

    // Find the active project
    const project = localProjects.find((p) => p.id === activeId)
    if (!project) {
      setActiveId(null)
      setTempProjects(localProjects)
      return
    }

    // If dropping on a column
    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '') as ProjectStatus

      // Skip if status hasn't changed
      if (project.status === newStatus) {
        setActiveId(null)
        setTempProjects(localProjects)
        return
      }

      // Get projects in the target column
      const projectsInTargetColumn = projectsByStatus[newStatus] || []

      // Calculate new order (at the end of the column)
      const newOrder = projectsInTargetColumn.length

      // Update in database
      updateProject.mutate({
        id: activeId,
        status: newStatus,
        order: newOrder,
      })

      // Update local state
      const updatedProjects = localProjects.map((p) =>
        p.id === activeId ? { ...p, status: newStatus, order: newOrder } : p
      )

      setLocalProjects(updatedProjects)
      setTempProjects(updatedProjects)
    }
    // If dropping on another project (for reordering)
    else if (activeId !== overId) {
      const activeProject = localProjects.find((p) => p.id === activeId)
      const overProject = localProjects.find((p) => p.id === overId)

      if (!activeProject || !overProject) {
        setActiveId(null)
        setTempProjects(localProjects)
        return
      }

      // If projects are in the same column, reorder
      if (activeProject.status === overProject.status) {
        const projectsInColumn = projectsByStatus[activeProject.status] || []
        const activeIndex = projectsInColumn.findIndex((p) => p.id === activeId)
        const overIndex = projectsInColumn.findIndex((p) => p.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          // Reorder projects
          const newOrder = arrayMove(projectsInColumn, activeIndex, overIndex).map((project, index) => ({
            ...project,
            order: index,
          }))

          // Update database
          newOrder.forEach((project) => {
            updateProject.mutate({
              id: project.id,
              order: project.order,
            })
          })

          // Update local state
          const updatedProjects = localProjects.map((project) => {
            const updatedProject = newOrder.find((p) => p.id === project.id)
            return updatedProject || project
          })

          setLocalProjects(updatedProjects)
          setTempProjects(updatedProjects)
        }
      }
      // If projects are in different columns, move to the new column at the position of the over project
      else {
        const newStatus = overProject.status
        const projectsInTargetColumn = projectsByStatus[newStatus] || []
        const overIndex = projectsInTargetColumn.findIndex((p) => p.id === overId)

        if (overIndex !== -1) {
          // Insert at the position of the over project
          const newProjectsInColumn = [...projectsInTargetColumn]
          newProjectsInColumn.splice(overIndex, 0, { ...activeProject, status: newStatus })

          // Update orders
          const updatedProjects = newProjectsInColumn.map((project, index) => ({ ...project, order: index }))

          // Update database
          updateProject.mutate({
            id: activeId,
            status: newStatus,
            order: overIndex,
          })

          // Update orders for all affected projects
          updatedProjects.forEach((project) => {
            if (project.id !== activeId) {
              updateProject.mutate({
                id: project.id,
                order: project.order,
              })
            }
          })

          // Update local state
          const finalUpdatedProjects = localProjects.map((project) => {
            if (project.id === activeId) {
              return { ...project, status: newStatus, order: overIndex }
            }
            const updatedProject = updatedProjects.find((p) => p.id === project.id)
            return updatedProject || project
          })

          setLocalProjects(finalUpdatedProjects)
          setTempProjects(finalUpdatedProjects)
        }
      }
    }

    setActiveId(null)
  }

  return (
    <div className="grid gap-6">
      <div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon />
          Add Project
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid h-[calc(100vh-10.5rem)] grid-cols-1 gap-4 md:grid-cols-4">
          {PROJECT_STATUSES.map((status) => (
            <ProjectKanbanColumn
              key={status}
              id={`column-${status}`}
              title={status.replace('_', ' ')}
              projects={projectsByStatus[status] || []}
              isActive={activeColumn === `column-${status}`}
            />
          ))}
        </div>

        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeProject ? <ProjectKanbanItem project={activeProject} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <AddProjectForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
