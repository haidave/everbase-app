import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { type Habit } from '@/db/schema'
import { isFuture, isSameMonth } from 'date-fns'

import { formatDateString } from '@/lib/formatters'
import { useHabitStreak } from '@/hooks/use-habit-streak'
import {
  useAllHabitCompletions,
  useCompleteHabitForDate,
  useHabitCompletionHistory,
  useUncompleteHabitForDate,
} from '@/hooks/use-habits'

type HabitProgressProps = {
  habit: Habit
}

export function HabitProgress({ habit }: HabitProgressProps) {
  const [date, setDate] = useState<Date>(new Date())

  // Calculate start and end dates for the current month view
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  // Get completion history for the current month view
  const { data: monthCompletions } = useHabitCompletionHistory(habit.id, startDate, endDate)

  // Get all completions for streak calculation
  const { data: allCompletions } = useAllHabitCompletions(habit.id)

  const completeHabitForDate = useCompleteHabitForDate()
  const uncompleteHabitForDate = useUncompleteHabitForDate()

  // Calculate streaks using our custom hook with all completions
  const { currentStreak, bestStreak } = useHabitStreak(allCompletions)

  // Create a Set of completed dates for easier lookup (for the calendar)
  const completedDates = new Set(
    monthCompletions?.map((completion) => {
      const utcDate = new Date(completion.completedAt)
      return formatDateString(utcDate)
    }) || []
  )

  // Handle day click to toggle completion
  const handleDayClick = (clickedDate: Date) => {
    // Only allow clicking on days in the current month and not in the future
    if (isFuture(clickedDate) || !isSameMonth(clickedDate, date)) return

    const dateStr = formatDateString(clickedDate)
    const isCompleted = completedDates.has(dateStr)

    if (isCompleted) {
      uncompleteHabitForDate.mutate({ habitId: habit.id, date: clickedDate })
    } else {
      completeHabitForDate.mutate({ habitId: habit.id, date: clickedDate })
    }
  }

  // Disable future dates
  const disabledDays = { after: new Date() }

  return (
    <div className="p-4">
      <Calendar
        mode="default"
        selected={undefined}
        onDayClick={handleDayClick}
        month={date}
        onMonthChange={setDate}
        className="mx-auto rounded-md border"
        disabled={disabledDays}
        modifiers={{
          completed: (day) => {
            const dayStr = formatDateString(day)
            return completedDates.has(dayStr)
          },
          outsideCurrentMonth: (day) => !isSameMonth(day, date),
        }}
        modifiersClassNames={{
          completed: 'bg-hover',
          outsideCurrentMonth: 'text-muted-foreground opacity-50 pointer-events-none',
        }}
      />
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <p>
          Current streak: <span className="font-medium">{currentStreak}</span>
        </p>
        <p>
          Best streak: <span className="font-medium">{bestStreak}</span>
        </p>
      </div>
    </div>
  )
}
