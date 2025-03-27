import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type Birthday } from '@/db/schema'
import { format, getMonth } from 'date-fns'
import { CalendarDaysIcon, PlusIcon } from 'lucide-react'

import { useBirthdays, useDeleteBirthday } from '@/hooks/use-birthdays'

import { AddBirthdayForm } from './add-birthday-form'
import { BirthdayListItem } from './birthday-list-item'

export function BirthdayList() {
  const { data: birthdays, isLoading } = useBirthdays()
  const deleteBirthday = useDeleteBirthday()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [birthdayToDelete, setBirthdayToDelete] = useState<Birthday | null>(null)

  if (isLoading) return <div className="p-4">Loading birthdays...</div>

  const handleDeleteBirthday = (birthday: Birthday) => {
    setBirthdayToDelete(birthday)
  }

  const confirmDelete = () => {
    if (birthdayToDelete) {
      deleteBirthday.mutate(birthdayToDelete.id)
      setBirthdayToDelete(null)
    }
  }

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
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 12 }, (_, i) => {
            const monthBirthdays = birthdaysByMonth?.[i] || []
            if (monthBirthdays.length === 0) return null

            // Create a date object for the current month to get its name
            const monthDate = new Date(2024, i, 1)
            const monthName = format(monthDate, 'LLLL')

            return (
              <Card key={monthName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CalendarDaysIcon className="size-5" />
                    {monthName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {monthBirthdays.map((birthday) => (
                    <BirthdayListItem key={birthday.id} birthday={birthday} onDelete={handleDeleteBirthday} />
                  ))}
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

      <ConfirmationDialog
        open={!!birthdayToDelete}
        onOpenChange={(open) => !open && setBirthdayToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the birthday for ${birthdayToDelete?.name}.`}
        onConfirm={confirmDelete}
        isLoading={deleteBirthday.isPending}
      />
    </div>
  )
}
