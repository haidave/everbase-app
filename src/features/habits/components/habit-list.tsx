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
import { Pencil, PlusIcon, Trash2 } from 'lucide-react'

import { useDeleteHabit, useHabits } from '@/hooks/use-habits'

import { HabitForm } from './habit-form'

export function HabitList() {
  const { data: habits, isLoading: isLoadingHabits } = useHabits()
  const deleteHabit = useDeleteHabit()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  if (isLoadingHabits) return <div className="p-4">Loading habits...</div>

  const activeHabits = habits?.filter((habit) => habit.active) || []

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
  }

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
        <Button variant="secondary" onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create your first habit
        </Button>
        <HabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Habits</h2>

        <Button variant="secondary" size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      <ul className="space-y-2">
        {activeHabits.map((habit) => (
          <li key={habit.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="font-medium">{habit.name}</p>
              {habit.description && <p className="text-muted-foreground text-sm">{habit.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditHabit(habit)}
                aria-label={`Edit habit ${habit.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteHabit(habit)}
                aria-label={`Delete habit ${habit.name}`}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Habit Form Dialog */}
      <HabitForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Habit Dialog */}
      {editingHabit && (
        <HabitForm
          open={!!editingHabit}
          onOpenChange={(open) => {
            if (!open) setEditingHabit(null)
          }}
          habit={editingHabit}
        />
      )}

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
