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

  const handleCheckChange = (checked: boolean) => {
    setChecked(checked)
    if (checked) {
      completeHabit.mutate(habit.id)
    } else {
      uncompleteHabit.mutate(habit.id)
    }
  }

  return (
    <li className="flex items-center gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={handleCheckChange}
        aria-label={`Mark habit ${habit.name} as ${checked ? 'incomplete' : 'complete'}`}
      />
      <p className="text-sm">{habit.name}</p>
    </li>
  )
}
