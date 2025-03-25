import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type Habit } from '@/db/schema'
import { PlusIcon } from 'lucide-react'

import { useDeleteHabit, useHabits } from '@/hooks/use-habits'

import { AddHabitForm } from './add-habit-form'
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
        <AddHabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
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
      <AddHabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!habitToDelete}
        onOpenChange={(open) => !open && setHabitToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the habit "${habitToDelete?.name}" and all its completion history.`}
        onConfirm={confirmDelete}
        isLoading={deleteHabit.isPending}
      />
    </div>
  )
}

export { HabitList }
