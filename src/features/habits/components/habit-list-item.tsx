import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Habit } from '@/db/schema'
import { PencilIcon } from 'lucide-react'

import { AddHabitForm } from './add-habit-form'
import { HabitProgress } from './habit-progress'

type HabitListItemProps = {
  habit: Habit
}

export function HabitListItem({ habit }: HabitListItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  return (
    <>
      <li className="bg-card grid gap-6 rounded-md border p-4">
        <div className="px">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-foreground-primary">{habit.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
              aria-label={`Edit habit ${habit.name}`}
            >
              <PencilIcon />
            </Button>
          </div>

          {habit.description ? <p className="text-muted-foreground text-xs">{habit.description}</p> : null}
        </div>

        <HabitProgress habit={habit} />
      </li>

      <AddHabitForm open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} habit={habit} />
    </>
  )
}
