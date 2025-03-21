import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { type Habit } from '@/db/schema'
import { isFuture } from 'date-fns'

import { useCompleteHabitForDate, useHabitCompletionHistory, useUncompleteHabitForDate } from '@/hooks/use-habits'

type HabitProgressProps = {
  habit: Habit
}

export function HabitProgress({ habit }: HabitProgressProps) {
  const [date, setDate] = useState<Date>(new Date())

  // Calculate start and end dates for the current month view
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  // Get completion history for the habit
  const { data: completions } = useHabitCompletionHistory(habit.id, startDate, endDate)
  const completeHabitForDate = useCompleteHabitForDate()
  const uncompleteHabitForDate = useUncompleteHabitForDate()

  // Create a Set of completed dates for easier lookup
  const completedDates = new Set(
    completions?.map((completion) => {
      // Parse the UTC date and convert to local date string
      const utcDate = new Date(completion.completedAt)
      // Format as YYYY-MM-DD using local date
      return `${utcDate.getFullYear()}-${String(utcDate.getMonth() + 1).padStart(2, '0')}-${String(utcDate.getDate()).padStart(2, '0')}`
    }) || []
  )

  // Handle day click to toggle completion
  const handleDayClick = (clickedDate: Date) => {
    if (isFuture(clickedDate)) return

    // Format the clicked date as YYYY-MM-DD for comparison
    const dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`
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
            // Format the calendar day as YYYY-MM-DD for comparison
            const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
            return completedDates.has(dayStr)
          },
        }}
        modifiersClassNames={{
          completed: 'bg-active hover:bg-hover',
        }}
      />
    </div>
  )
}
