import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

import { useHabits } from '@/hooks/use-habits'

import { AddHabitForm } from './add-habit-form'
import { HabitListItem } from './habit-list-item'

const HabitList = () => {
  const { data: habits, isLoading: isLoadingHabits } = useHabits()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  if (isLoadingHabits) return <div className="p-4">Loading habits...</div>

  const activeHabits = habits?.filter((habit) => habit.active) || []

  if (!activeHabits.length) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>No habits yet.</p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon />
          Create your first habit
        </Button>
        <AddHabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Habit
      </Button>

      <ul className="flex flex-wrap gap-4">
        {activeHabits.map((habit) => (
          <HabitListItem key={habit.id} habit={habit} />
        ))}
      </ul>

      <AddHabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}

export { HabitList }
