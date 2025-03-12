import { format } from 'date-fns'

import { useHabits, useTodayHabitCompletions } from '@/hooks/use-habits'

import { HabitItem } from './habit-item'

export function DashboardHabits() {
  const { data: habits, isLoading: isLoadingHabits } = useHabits()
  const { data: todayCompletions, isLoading: isLoadingCompletions } = useTodayHabitCompletions()

  const isLoading = isLoadingHabits || isLoadingCompletions

  if (isLoading) return <div className="p-4">Loading habits...</div>

  const activeHabits = habits?.filter((habit) => habit.active) || []

  // Create a map of habit IDs to completion status
  const completionMap = new Map()
  todayCompletions?.forEach((completion) => {
    completionMap.set(completion.habitId, true)
  })

  const formattedDate = format(new Date(), 'EEEE / d.MM.yyyy')

  if (!activeHabits.length) {
    return <div className="p-4 text-center">No active habits to display.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Habits</h2>
        <p className="text-muted-foreground text-sm">{formattedDate}</p>
      </div>

      <ul className="space-y-2">
        {activeHabits.map((habit) => (
          <HabitItem key={habit.id} habit={habit} isCompleted={!!completionMap.get(habit.id)} />
        ))}
      </ul>
    </div>
  )
}
