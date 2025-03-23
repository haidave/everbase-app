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
import { type Birthday } from '@/db/schema'
import { PlusIcon } from 'lucide-react'

import { useBirthdays, useDeleteBirthday } from '@/hooks/use-birthdays'

import { AddBirthdayForm } from './add-birthday-form'
import { BirthdayListItem } from './birthday-list-item'

export function BirthdayList() {
  const { data: birthdays, isLoading } = useBirthdays()
  const deleteBirthday = useDeleteBirthday()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [birthdayToDelete, setBirthdayToDelete] = useState<Birthday | null>(null)

  if (isLoading) return <div className="p-4">Loading birthdays...</div>

  const handleDeleteBirthday = (birthday: Birthday) => {
    setBirthdayToDelete(birthday)
  }

  const confirmDelete = () => {
    if (birthdayToDelete) {
      deleteBirthday.mutate(birthdayToDelete.id)
      setBirthdayToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Birthday
      </Button>

      {birthdays && birthdays.length > 0 ? (
        <div className="space-y-4">
          {birthdays.map((birthday) => (
            <BirthdayListItem key={birthday.id} birthday={birthday} onDelete={handleDeleteBirthday} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center">No birthdays yet.</p>
      )}

      <AddBirthdayForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      <AlertDialog open={!!birthdayToDelete} onOpenChange={(open) => !open && setBirthdayToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the birthday for &quot;{birthdayToDelete?.name}&quot;.
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
