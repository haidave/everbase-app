import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Birthday } from '@/db/schema'
import { calculateNextBirthdayAge } from '@/features/birthdays/lib/utils'
import { format } from 'date-fns'

import { AddBirthdayForm } from './add-birthday-form'

type BirthdayListItemProps = {
  birthday: Birthday
}

export function BirthdayListItem({ birthday }: BirthdayListItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const birthDate = new Date(birthday.birthDate)
  const nextAge = calculateNextBirthdayAge(birthday.birthDate)

  return (
    <>
      <Button variant="ghost" onClick={() => setIsEditDialogOpen(true)} className="h-max justify-start">
        <div className="grid gap-1 text-left">
          <p className="text-muted-foreground">{format(birthDate, 'do')}</p>
          <div>
            <span className="text-sm">{birthday.name}</span>
            <span className="text-muted-foreground ml-2 text-xs">(turns {nextAge})</span>
          </div>
        </div>
      </Button>

      <AddBirthdayForm open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} birthday={birthday} />
    </>
  )
}
