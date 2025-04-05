import { useMemo } from 'react'
import { type Task } from '@/db/schema'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'
import { useTasksProjects } from '@/hooks/use-task-projects'

import { TaskKanbanItem } from './task-kanban-item'
import { TaskKanbanProjectGroup } from './task-kanban-project-group'

type TaskKanbanColumnProps = {
  id: string
  title: string
  tasks: Task[]
  isActive?: boolean
  groupByProject?: boolean
}

// Add this type definition at the top of the file
type EnhancedTask = Task & {
  projectId: string | null
  projectName: string | null
}

export function TaskKanbanColumn({ id, title, tasks, isActive = false, groupByProject = true }: TaskKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Get all task IDs in this column
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks])

  // Fetch project data for all tasks in this column using the hook
  const { data: taskProjectMap = {}, isLoading: isLoadingProjects } = useTasksProjects(groupByProject ? taskIds : [])

  // Enhance tasks with project information
  const enhancedTasks = useMemo(() => {
    return tasks.map((task) => {
      const projectInfo = taskProjectMap[task.id]
      return {
        ...task,
        projectId: projectInfo?.id || null,
        projectName: projectInfo?.name || null,
      } as EnhancedTask
    })
  }, [tasks, taskProjectMap])

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    if (!groupByProject) {
      return { null: enhancedTasks }
    }

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
  }, [enhancedTasks, groupByProject])

  // Get project names for each group
  const projectGroups = useMemo(() => {
    return Object.entries(tasksByProject)
      .map(([projectId, projectTasks]) => {
        // For the null key (ungrouped tasks)
        if (projectId === 'null') {
          return {
            projectId: null,
            projectName: 'Ungrouped',
            tasks: projectTasks,
          }
        }

        // For tasks with project associations
        return {
          projectId,
          projectName: projectTasks[0]?.projectName || 'Unknown Project',
          tasks: projectTasks,
        }
      })
      .sort((a, b) => {
        // Sort null (ungrouped) to the end
        if (a.projectId === null) return 1
        if (b.projectId === null) return -1
        // Sort alphabetically by project name
        return (a.projectName || '').localeCompare(b.projectName || '')
      })
  }, [tasksByProject])

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
        {groupByProject ? (
          isLoadingProjects && Object.keys(taskProjectMap).length === 0 ? (
            <div className="text-muted-foreground text-xs">Loading projects...</div>
          ) : (
            projectGroups.map((group) => (
              <TaskKanbanProjectGroup
                key={group.projectId || 'ungrouped'}
                projectId={group.projectId}
                projectName={group.projectName}
                tasks={group.tasks}
              />
            ))
          )
        ) : (
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskKanbanItem key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}
