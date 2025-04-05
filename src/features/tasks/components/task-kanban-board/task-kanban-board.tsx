import { useEffect, useMemo, useState } from 'react'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/db/schema'
import { useTaskFiltersStore } from '@/store/use-task-filters-store'
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

import { useFeatureTasks } from '@/hooks/use-features'
import { useProjectTasks } from '@/hooks/use-projects'
import { useTasks, useUpdateTask } from '@/hooks/use-tasks'

import { TaskKanbanColumn } from './parts/task-kanban-column'
import { TaskKanbanItem } from './parts/task-kanban-item'

type TaskKanbanBoardProps = {
  tasks?: Task[]
  groupBy?: 'project' | 'feature' | 'none'
  isProjectView?: boolean
}

export function TaskKanbanBoard({
  tasks: propTasks,
  groupBy = 'project', // Default to project grouping for backward compatibility
  isProjectView = false,
}: TaskKanbanBoardProps) {
  // Get filter values from Zustand store
  const { projectId, featureId, groupByProject, groupByFeatureInProjectView } = useTaskFiltersStore()

  // Use the groupBy prop to determine grouping behavior
  // If in project view, use the project-specific grouping setting
  // Otherwise use the main grouping setting
  const effectiveGroupBy = isProjectView
    ? groupByFeatureInProjectView
      ? 'feature'
      : 'none'
    : !groupByProject
      ? 'none'
      : groupBy

  // Fetch tasks based on filters
  const { data: fetchedTasks, isLoading, error } = useTasks()
  const { data: projectTasks, isLoading: isLoadingProjectTasks } = useProjectTasks(projectId || '')
  const { data: featureTasks, isLoading: isLoadingFeatureTasks } = useFeatureTasks(featureId || '')

  const updateTask = useUpdateTask()

  // State for active drag item
  const [activeId, setActiveId] = useState<string | null>(null)

  // Track the current column being dragged over for visual feedback
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  // Local state to track tasks
  const [localTasks, setLocalTasks] = useState<Task[]>([])

  // Temporary state for tasks during drag operations
  const [tempTasks, setTempTasks] = useState<Task[]>([])

  // Determine which tasks to display based on filters
  const allTasks = useMemo(() => {
    // If specific tasks are provided as props, use those
    if (propTasks) return propTasks

    // If feature filter is active, use feature tasks
    if (featureId && featureTasks) return featureTasks

    // If project filter is active, use project tasks
    if (projectId && projectTasks) return projectTasks

    // Otherwise use all tasks
    return fetchedTasks || []
  }, [propTasks, projectId, featureId, projectTasks, featureTasks, fetchedTasks])

  // Update local tasks when allTasks changes
  useEffect(() => {
    setLocalTasks(allTasks)
    setTempTasks(allTasks)
  }, [allTasks])

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const tasksToUse = activeId ? tempTasks : localTasks

    return TASK_STATUSES.reduce(
      (acc, status) => {
        acc[status] = tasksToUse
          .filter((task) => task.status === status)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        return acc
      },
      {} as Record<TaskStatus, Task[]>
    )
  }, [localTasks, tempTasks, activeId])

  // Update the loading state to account for filter-specific loading
  const isLoadingAny = isLoading || (projectId && isLoadingProjectTasks) || (featureId && isLoadingFeatureTasks)

  if (isLoadingAny && !propTasks) return <div className="p-4">Loading tasks...</div>
  if (error && !propTasks) return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  if (!localTasks?.length) return <p>No tasks found.</p>

  // Find the active task
  const activeTask = activeId ? localTasks.find((task) => task.id === activeId) || null : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString())
    // Initialize tempTasks with current localTasks
    setTempTasks(localTasks)
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

    // If hovering over a task, find its column
    const overTask = localTasks.find((t) => t.id === overId)
    if (overTask) {
      setActiveColumn(`column-${overTask.status}`)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Reset active column
    setActiveColumn(null)

    if (!over) {
      setActiveId(null)
      // Reset temp tasks
      setTempTasks(localTasks)
      return
    }

    const activeId = active.id.toString()
    const overId = over.id.toString()

    // Find the active task
    const task = localTasks.find((t) => t.id === activeId)
    if (!task) {
      setActiveId(null)
      setTempTasks(localTasks)
      return
    }

    // If dropping on a column
    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '') as TaskStatus

      // Skip if status hasn't changed
      if (task.status === newStatus) {
        setActiveId(null)
        setTempTasks(localTasks)
        return
      }

      // Get tasks in the target column
      const tasksInTargetColumn = tasksByStatus[newStatus] || []

      // Calculate new order (at the end of the column)
      const newOrder = tasksInTargetColumn.length

      // Update in database
      updateTask.mutate({
        id: activeId,
        status: newStatus,
        order: newOrder,
      })

      // Update local state
      const updatedTasks = localTasks.map((t) => (t.id === activeId ? { ...t, status: newStatus, order: newOrder } : t))

      setLocalTasks(updatedTasks)
      setTempTasks(updatedTasks)
    }
    // If dropping on another task (for reordering)
    else if (activeId !== overId) {
      const activeTask = localTasks.find((t) => t.id === activeId)
      const overTask = localTasks.find((t) => t.id === overId)

      if (!activeTask || !overTask) {
        setActiveId(null)
        setTempTasks(localTasks)
        return
      }

      // If tasks are in the same column, reorder
      if (activeTask.status === overTask.status) {
        const tasksInColumn = tasksByStatus[activeTask.status] || []
        const activeIndex = tasksInColumn.findIndex((t) => t.id === activeId)
        const overIndex = tasksInColumn.findIndex((t) => t.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          // Reorder tasks
          const newOrder = arrayMove(tasksInColumn, activeIndex, overIndex).map((task, index) => ({
            ...task,
            order: index,
          }))

          // Update database
          newOrder.forEach((task) => {
            updateTask.mutate({
              id: task.id,
              order: task.order,
            })
          })

          // Update local state
          const updatedTasks = localTasks.map((task) => {
            const updatedTask = newOrder.find((t) => t.id === task.id)
            return updatedTask || task
          })

          setLocalTasks(updatedTasks)
          setTempTasks(updatedTasks)
        }
      }
      // If tasks are in different columns, move to the new column at the position of the over task
      else {
        const newStatus = overTask.status
        const tasksInTargetColumn = tasksByStatus[newStatus] || []
        const overIndex = tasksInTargetColumn.findIndex((t) => t.id === overId)

        if (overIndex !== -1) {
          // Insert at the position of the over task
          const newTasksInColumn = [...tasksInTargetColumn]
          newTasksInColumn.splice(overIndex, 0, { ...activeTask, status: newStatus })

          // Update orders
          const updatedTasks = newTasksInColumn.map((task, index) => ({ ...task, order: index }))

          // Update database
          updateTask.mutate({
            id: activeId,
            status: newStatus,
            order: overIndex,
          })

          // Update orders for all affected tasks
          updatedTasks.forEach((task) => {
            if (task.id !== activeId) {
              updateTask.mutate({
                id: task.id,
                order: task.order,
              })
            }
          })

          // Update local state
          const finalUpdatedTasks = localTasks.map((task) => {
            if (task.id === activeId) {
              return { ...task, status: newStatus, order: overIndex }
            }
            const updatedTask = updatedTasks.find((t) => t.id === task.id)
            return updatedTask || task
          })

          setLocalTasks(finalUpdatedTasks)
          setTempTasks(finalUpdatedTasks)
        }
      }
    }

    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid h-[calc(100vh-10.5rem)] grid-cols-1 gap-4 md:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <TaskKanbanColumn
            key={status}
            id={`column-${status}`}
            title={status.replace('_', ' ')}
            tasks={tasksByStatus[status] || []}
            isActive={activeColumn === `column-${status}`}
            groupBy={effectiveGroupBy}
          />
        ))}
      </div>

      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeTask ? <TaskKanbanItem task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
