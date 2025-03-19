import { type Journal } from '@/db/schema'
import { format, isToday, isYesterday } from 'date-fns'

import { useJournals } from '@/hooks/use-journals'

import { JournalItem } from './journal-item'

export function JournalList() {
  const { data: journals, isLoading } = useJournals()

  if (isLoading) return <div className="p-4">Loading journals...</div>
  if (!journals?.length) return <div className="p-4">No journal entries yet.</div>

  // Group journals by date
  const journalsByDate = journals.reduce<Record<string, Journal[]>>((acc, journal) => {
    const date = new Date(journal.createdAt)
    const dateKey = format(date, 'yyyy-MM-dd')

    if (!acc[dateKey]) {
      acc[dateKey] = []
    }

    acc[dateKey].push(journal)
    return acc
  }, {})

  // Sort dates in descending order
  const sortedDates = Object.keys(journalsByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-8">
      {sortedDates.map((dateKey) => {
        const journalsForDate = journalsByDate[dateKey]
        const date = new Date(dateKey)

        // Format the date label
        let dateLabel: string
        if (isToday(date)) {
          dateLabel = 'Today'
        } else if (isYesterday(date)) {
          dateLabel = 'Yesterday'
        } else {
          dateLabel = format(date, 'MMMM d, yyyy')
        }

        return (
          <div key={dateKey} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{dateLabel}</h3>
              <span className="text-muted-foreground text-sm">{journalsForDate.length}</span>
            </div>

            <div className="space-y-4">
              {journalsForDate.map((journal) => (
                <JournalItem key={journal.id} journal={journal} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
