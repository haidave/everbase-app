import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type Birthday } from '@/db/schema'
import { format, getMonth, isSameMonth } from 'date-fns'
import { CalendarDaysIcon, PlusIcon } from 'lucide-react'

import { formatDateString } from '@/lib/formatters'
import { useBirthdays } from '@/hooks/use-birthdays'

import { AddBirthdayForm } from './add-birthday-form'
import { BirthdayListItem } from './birthday-list-item'

export function BirthdayList() {
  const { data: birthdays, isLoading } = useBirthdays()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  if (isLoading) return <div className="p-4">Loading birthdays...</div>

  // Group birthdays by month
  const birthdaysByMonth = birthdays?.reduce(
    (acc, birthday) => {
      const month = getMonth(new Date(birthday.birthDate))
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(birthday)
      return acc
    },
    {} as Record<number, Birthday[]>
  )

  // Sort birthdays within each month by day
  Object.values(birthdaysByMonth || {}).forEach((monthBirthdays) => {
    monthBirthdays.sort((a, b) => {
      const dayA = new Date(a.birthDate).getDate()
      const dayB = new Date(b.birthDate).getDate()
      return dayA - dayB
    })
  })

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Birthday
      </Button>

      {birthdays && birthdays.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 12 }, (_, i) => {
            const monthBirthdays = birthdaysByMonth?.[i] || []
            if (monthBirthdays.length === 0) return null

            const currentYear = new Date().getFullYear()
            const monthDate = new Date(currentYear, i, 1)
            const monthName = format(monthDate, 'LLLL')

            // Create a Set of birthday dates for easier lookup
            const birthdayDates = new Set(
              monthBirthdays.map((birthday) => {
                const birthDate = new Date(birthday.birthDate)
                const thisYearBirthday = new Date(currentYear, i, birthDate.getDate())
                return formatDateString(thisYearBirthday)
              })
            )

            return (
              <Card key={monthName}>
                <CardHeader>
                  <span className="text-foreground-primary flex items-center gap-2">
                    <CalendarDaysIcon className="size-4" />
                    {monthName}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 xl:flex-row">
                    <div className="w-full md:w-auto">
                      <Calendar
                        mode="default"
                        month={monthDate}
                        selected={undefined}
                        className="rounded-md border"
                        modifiers={{
                          hasBirthday: (date) => {
                            const dayStr = formatDateString(date)
                            return birthdayDates.has(dayStr)
                          },
                          outsideCurrentMonth: (date) => !isSameMonth(date, monthDate),
                        }}
                        modifiersClassNames={{
                          hasBirthday: 'bg-hover',
                          outsideCurrentMonth: 'text-muted-foreground opacity-50',
                        }}
                        disableNavigation
                      />
                    </div>
                    <div className="flex max-h-[300px] w-full flex-col gap-2 overflow-y-auto">
                      {monthBirthdays.map((birthday) => (
                        <BirthdayListItem key={birthday.id} birthday={birthday} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-4 p-8">
          <CalendarDaysIcon className="text-muted-foreground size-12" />
          <p className="text-center">No birthdays added yet.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon />
            Add Birthday
          </Button>
        </Card>
      )}

      <AddBirthdayForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
