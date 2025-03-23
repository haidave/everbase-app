import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { type Habit } from '@/db/schema'
import { PlusIcon } from 'lucide-react'

import { useDeleteHabit, useHabits } from '@/hooks/use-habits'

import { HabitForm } from './habit-form'
import { HabitListItem } from './habit-list-item'

const HabitList = () => {
  const { data: habits, isLoading: isLoadingHabits } = useHabits()
  const deleteHabit = useDeleteHabit()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  if (isLoadingHabits) return <div className="p-4">Loading habits...</div>

  const activeHabits = habits?.filter((habit) => habit.active) || []

  const handleDeleteHabit = (habit: Habit) => {
    setHabitToDelete(habit)
  }

  const confirmDelete = () => {
    if (habitToDelete) {
      deleteHabit.mutate(habitToDelete.id)
      setHabitToDelete(null)
    }
  }

  if (!activeHabits.length) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>No habits yet.</p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon />
          Create your first habit
        </Button>
        <HabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Habit
      </Button>

      <ul className="flex flex-wrap gap-4">
        {activeHabits.map((habit) => (
          <HabitListItem key={habit.id} habit={habit} onDelete={handleDeleteHabit} />
        ))}
      </ul>

      {/* Habit Form Dialog */}
      <HabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit &ldquo;{habitToDelete?.name}&rdquo; and all its completion history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { HabitList }
