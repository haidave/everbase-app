import { useMemo } from 'react'
import { type Task } from '@/db/schema'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'
import { useTasksFeatures } from '@/hooks/use-task-features'
import { useTasksProjects } from '@/hooks/use-task-projects'

import { TaskKanbanFeatureGroup } from './task-kanban-feature-group'
import { TaskKanbanItem } from './task-kanban-item'
import { TaskKanbanProjectGroup } from './task-kanban-project-group'

type TaskKanbanColumnProps = {
  id: string
  title: string
  tasks: Task[]
  isActive?: boolean
  groupBy?: 'project' | 'feature' | 'none'
}

// Add this type definition at the top of the file
type EnhancedTask = Task & {
  projectId: string | null
  projectName: string | null
  featureId: string | null
  featureName: string | null
}

export function TaskKanbanColumn({ id, title, tasks, isActive = false, groupBy = 'project' }: TaskKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Get all task IDs in this column
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks])

  // Fetch project data for all tasks in this column using the hook
  const { data: taskProjectMap = {}, isLoading: isLoadingProjects } = useTasksProjects(
    groupBy === 'project' ? taskIds : []
  )

  // Fetch feature data for all tasks in this column
  const { data: taskFeatureMap = {}, isLoading: isLoadingFeatures } = useTasksFeatures(
    groupBy === 'feature' ? taskIds : []
  )

  // Enhance tasks with project and/or feature information
  const enhancedTasks = useMemo(() => {
    return tasks.map((task) => {
      const projectInfo = taskProjectMap[task.id]
      const featureInfo = taskFeatureMap[task.id]
      return {
        ...task,
        projectId: projectInfo?.id || null,
        projectName: projectInfo?.name || null,
        featureId: featureInfo?.id || null,
        featureName: featureInfo?.name || null,
      } as EnhancedTask
    })
  }, [tasks, taskProjectMap, taskFeatureMap])

  // Group tasks based on the groupBy prop
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { null: enhancedTasks }
    }

    if (groupBy === 'project') {
      return enhancedTasks.reduce(
        (acc, task) => {
          const projectId = task.projectId || 'null'
          if (!acc[projectId]) {
            acc[projectId] = []
          }
          acc[projectId].push(task)
          return acc
        },
        {} as Record<string, EnhancedTask[]>
      )
    }

    // Group by feature
    return enhancedTasks.reduce(
      (acc, task) => {
        const featureId = task.featureId || 'null'
        if (!acc[featureId]) {
          acc[featureId] = []
        }
        acc[featureId].push(task)
        return acc
      },
      {} as Record<string, EnhancedTask[]>
    )
  }, [enhancedTasks, groupBy])

  // Get group names and sort them
  const groups = useMemo(() => {
    if (groupBy === 'none') {
      return [{ id: null, name: null, tasks: enhancedTasks }]
    }

    return Object.entries(groupedTasks)
      .map(([id, groupTasks]) => {
        // For the null key (ungrouped tasks)
        if (id === 'null') {
          return {
            id: null,
            name: 'Ungrouped',
            tasks: groupTasks,
          }
        }

        // For tasks with associations
        if (groupBy === 'project') {
          return {
            id,
            name: groupTasks[0]?.projectName || 'Unknown Project',
            tasks: groupTasks,
          }
        } else {
          return {
            id,
            name: groupTasks[0]?.featureName || 'Unknown Feature',
            tasks: groupTasks,
          }
        }
      })
      .sort((a, b) => {
        // Sort null (ungrouped) to the end
        if (a.id === null) return 1
        if (b.id === null) return -1
        // Sort alphabetically by name
        return (a.name || '').localeCompare(b.name || '')
      })
  }, [groupedTasks, groupBy, enhancedTasks])

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
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {groupBy === 'none' ? (
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskKanbanItem key={task.id} task={task} />
            ))}
          </SortableContext>
        ) : groupBy === 'project' ? (
          isLoadingProjects && Object.keys(taskProjectMap).length === 0 ? (
            <div className="text-muted-foreground text-xs">Loading projects...</div>
          ) : (
            groups.map((group) => (
              <TaskKanbanProjectGroup
                key={group.id || 'ungrouped'}
                projectId={group.id}
                projectName={group.name}
                tasks={group.tasks}
              />
            ))
          )
        ) : isLoadingFeatures && Object.keys(taskFeatureMap).length === 0 ? (
          <div className="text-muted-foreground text-xs">Loading features...</div>
        ) : (
          groups.map((group) => (
            <TaskKanbanFeatureGroup
              key={group.id || 'ungrouped'}
              featureId={group.id}
              featureName={group.name}
              tasks={group.tasks}
            />
          ))
        )}
      </div>
    </div>
  )
}
