import { type Birthday, type Event } from '@/db/schema'
import { calculateNextBirthdayAge, getNextBirthdayDate } from '@/features/birthdays/lib/utils'
import { addDays } from 'date-fns'

export type UpcomingItem = {
  id: string
  date: Date
  title: string
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = addDays(today, daysAhead)

  // Process birthdays to get this year's dates
  const birthdayItems: UpcomingItem[] = birthdays.map((birthday) => {
    const nextBirthday = getNextBirthdayDate(birthday.birthDate)
    const age = calculateNextBirthdayAge(birthday.birthDate)

    return {
      id: birthday.id,
      date: nextBirthday,
      title: `${birthday.name}'s Birthday (${age})`,
      type: 'birthday' as const,
      url: '/birthdays',
    }
  })

  // Process events
  const eventItems: UpcomingItem[] = events.map((event) => ({
    id: event.id,
    date: new Date(event.date),
    title: event.title,
    type: 'event' as const,
    url: '/events',
  }))

  // Combine, sort, and filter items
  return [...birthdayItems, ...eventItems]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter((item) => {
      const itemDate = new Date(item.date)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate >= today && itemDate <= endDate
    })
}
