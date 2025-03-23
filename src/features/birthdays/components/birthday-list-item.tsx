import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const futureAge = calculateNextBirthdayAge(birthday.birthDate)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{birthday.name}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(birthday)}>
                <Trash2 />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {format(new Date(birthday.birthDate), 'PPP')} (turns {futureAge})
          </CardDescription>
          {birthday.description && <p className="mt-2">{birthday.description}</p>}
        </CardContent>
      </Card>

      <AddBirthdayForm open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} birthday={birthday} />
    </>
  )
}
