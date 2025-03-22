import { subDays } from 'date-fns'

import { type HabitCompletion } from '@/lib/api'
import { formatDateString } from '@/lib/formatters'

export function useHabitStreak(completions: HabitCompletion[] | undefined) {
  if (!completions || completions.length === 0) return { currentStreak: 0, bestStreak: 0 }

  // Convert to date strings and create a Set for faster lookups
  const completionDateSet = new Set(
    completions.map((completion) => {
      const date = new Date(completion.completedAt)
      return formatDateString(date)
    })
  )

  // Get today's date string
  const today = new Date()
  const todayStr = formatDateString(today)

  // Calculate current streak
  let currentStreak = 0
  let checkDate = today
  let checkDateStr = todayStr

  // If today is completed, start counting from today
  if (completionDateSet.has(checkDateStr)) {
    currentStreak = 1

    // Check previous days
    while (true) {
      checkDate = subDays(checkDate, 1)
      checkDateStr = formatDateString(checkDate)

      if (completionDateSet.has(checkDateStr)) {
        currentStreak++
      } else {
        break
      }
    }
  } else {
    // Today is not completed, check if yesterday was completed
    checkDate = subDays(today, 1)
    checkDateStr = formatDateString(checkDate)

    if (completionDateSet.has(checkDateStr)) {
      currentStreak = 1

      // Check days before yesterday
      while (true) {
        checkDate = subDays(checkDate, 1)
        checkDateStr = formatDateString(checkDate)

        if (completionDateSet.has(checkDateStr)) {
          currentStreak++
        } else {
          break
        }
      }
    }
  }

  // Calculate best streak by finding all streaks
  let bestStreak = currentStreak

  // Get all dates as Date objects for easier manipulation
  const allDates = Array.from(completionDateSet)
    .map((dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    })
    .sort((a, b) => a.getTime() - b.getTime())

  // Find all streaks
  let streakStart = 0
  for (let i = 0; i < allDates.length; i++) {
    // If this is the last date or there's a gap to the next date
    if (
      i === allDates.length - 1 ||
      allDates[i + 1].getTime() - allDates[i].getTime() > 86400000 // More than 1 day (in milliseconds)
    ) {
      // Calculate streak length
      const streakLength = i - streakStart + 1
      bestStreak = Math.max(bestStreak, streakLength)

      // Start a new streak
      streakStart = i + 1
    }
  }

  return { currentStreak, bestStreak }
}
