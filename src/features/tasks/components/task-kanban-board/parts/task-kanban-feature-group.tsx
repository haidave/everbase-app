import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Task } from '@/db/schema'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { TaskKanbanItem } from './task-kanban-item'

type TaskKanbanFeatureGroupProps = {
  featureId: string | null
  featureName: string | null
  tasks: Task[]
}

export function TaskKanbanFeatureGroup({ featureId, featureName, tasks }: TaskKanbanFeatureGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // For tasks without a feature, use "Ungrouped"
  const displayName = featureName || 'Ungrouped'

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex h-6 items-center gap-1 px-2 font-medium"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronDown />}
          {featureId ? <span>{displayName}</span> : <span className="text-muted-foreground">{displayName}</span>}
          <span className="text-muted-foreground ml-px">({tasks.length})</span>
        </Button>
      </div>

      <div className={cn('flex flex-1 flex-col gap-2', isCollapsed && 'hidden')}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskKanbanItem key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
