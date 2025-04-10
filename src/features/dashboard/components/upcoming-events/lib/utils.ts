import { type Birthday, type Event } from '@/db/schema'
import { calculateNextBirthdayAge, getNextBirthdayDate } from '@/features/birthdays/lib/utils'
import { addDays, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns'

export type UpcomingItem = {
  id: string
  date: Date
  title: string
  description?: string
  type: 'birthday' | 'event'
  url: string
}

export function getFilteredUpcomingItems(
  birthdays: Birthday[] | undefined,
  events: Event[] | undefined,
  daysAhead = 30
): UpcomingItem[] {
  if (!birthdays || !events) return []

  // Current date for calculations
  const today = startOfDay(new Date())
  const endDate = addDays(today, daysAhead)

  // Process birthdays to get this year's dates
  const birthdayItems: UpcomingItem[] = birthdays.map((birthday) => {
    const nextBirthday = getNextBirthdayDate(birthday.birthDate)
    const age = calculateNextBirthdayAge(birthday.birthDate)

    return {
      id: birthday.id,
      date: nextBirthday,
      title: `${birthday.name}'s Birthday (${age})`,
      description: birthday.description ?? undefined,
      type: 'birthday' as const,
      url: '/birthdays',
    }
  })

  // Process events
  const eventItems: UpcomingItem[] = events.map((event) => ({
    id: event.id,
    date: new Date(event.date),
    title: event.title,
    description: event.description ?? undefined,
    type: 'event' as const,
    url: '/events',
  }))

  // Combine, sort, and filter items
  return [...birthdayItems, ...eventItems]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter((item) => {
      // Include items that are today or in the future (within daysAhead)
      return (
        isSameDay(item.date, today) ||
        (isAfter(item.date, today) && isBefore(item.date, endDate)) ||
        isSameDay(item.date, endDate)
      )
    })
}
