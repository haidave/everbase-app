import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Birthday } from '@/db/schema'
import { calculateNextBirthdayAge } from '@/features/birthdays/lib/utils'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'

import { AddBirthdayForm } from './add-birthday-form'

type BirthdayListItemProps = {
  birthday: Birthday
  onDelete: (birthday: Birthday) => void
}

export function BirthdayListItem({ birthday, onDelete }: BirthdayListItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const birthDate = new Date(birthday.birthDate)
  const nextAge = calculateNextBirthdayAge(birthday.birthDate)

  return (
    <>
      <div className="group flex items-center justify-between gap-2">
        <div className="grid gap-1">
          <p className="text-muted-foreground text-sm">{format(birthDate, 'do')}</p>
          <p className="font-medium">
            {birthday.name} <span className="text-muted-foreground text-xs">(turns {nextAge})</span>
          </p>
        </div>
        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(birthday)}>
            <Trash2 />
          </Button>
        </div>
      </div>

      <AddBirthdayForm open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} birthday={birthday} />
    </>
  )
}
