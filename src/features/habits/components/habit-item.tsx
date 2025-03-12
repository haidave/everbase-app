import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { type Habit } from '@/db/schema'

import { useCompleteHabit, useUncompleteHabit } from '@/hooks/use-habits'

type HabitItemProps = {
  habit: Habit
  isCompleted: boolean
}

export function HabitItem({ habit, isCompleted }: HabitItemProps) {
  const completeHabit = useCompleteHabit()
  const uncompleteHabit = useUncompleteHabit()
  const [checked, setChecked] = useState(isCompleted)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCheckChange = (checked: boolean) => {
    setChecked(checked)
    setIsUpdating(true)

    if (checked) {
      completeHabit.mutate(habit.id, {
        onSettled: () => setIsUpdating(false),
      })
    } else {
      uncompleteHabit.mutate(habit.id, {
        onSettled: () => setIsUpdating(false),
      })
    }
  }

  return (
    <li className="flex items-center gap-3 py-2">
      <Checkbox
        checked={checked}
        onCheckedChange={handleCheckChange}
        disabled={isUpdating}
        aria-label={`Mark habit ${habit.name} as ${checked ? 'incomplete' : 'complete'}`}
      />
      <div>
        <p className="text-sm">{habit.name}</p>
        {habit.description && <p className="text-muted-foreground text-sm">{habit.description}</p>}
      </div>
    </li>
  )
}
