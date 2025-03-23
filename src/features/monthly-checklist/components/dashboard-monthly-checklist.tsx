import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'

import { useMonthlyChecklist, useMonthlyChecklistCompletions } from '@/hooks/use-monthly-checklist'

import { MonthlyChecklistItem } from './monthly-checklist-item'

export function DashboardMonthlyChecklist() {
  const { data: monthlyChecklist, isLoading: isLoadingChecklists } = useMonthlyChecklist()
  const { data: completions, isLoading: isLoadingCompletions } = useMonthlyChecklistCompletions()

  if (isLoadingChecklists || isLoadingCompletions) {
    return <div>Loading monthly checklist...</div>
  }

  if (!monthlyChecklist?.length) {
    return (
      <div className="text-center">
        <p className="mb-2">No monthly checklist items yet.</p>
        <Link to="/monthly-checklist" className="text-primary hover:underline">
          Create your first monthly checklist item
        </Link>
      </div>
    )
  }

  const currentMonth = format(new Date(), 'MMMM yyyy')

  // Create a map of completed items
  const completedMap = new Map(completions?.map((completion) => [completion.monthlyChecklistId, completion]) || [])

  // Filter active items and sort: incomplete first, then completed
  // Within each group, sort by creation date (oldest first)
  const activeItems = monthlyChecklist
    .filter((item) => item.active)
    .sort((a, b) => {
      const aCompleted = completedMap.has(a.id)
      const bCompleted = completedMap.has(b.id)

      if (aCompleted === bCompleted) {
        // If both items have the same completion status, sort by creation date
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      // Otherwise, incomplete items come first
      return aCompleted ? 1 : -1
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-foreground-primary text-sm">Monthly Checklist</h2>
        <span className="text-muted-foreground text-xs">{currentMonth}</span>
      </div>

      {activeItems.length === 0 ? (
        <p className="text-muted-foreground text-center">No active items in your monthly checklist.</p>
      ) : (
        <ul className="max-h-[300px] space-y-2 overflow-y-auto">
          {activeItems.map((item) => (
            <MonthlyChecklistItem key={item.id} monthlyChecklist={item} isCompleted={completedMap.has(item.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}
