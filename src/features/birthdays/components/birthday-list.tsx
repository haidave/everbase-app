import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
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

      <ConfirmationDialog
        open={!!birthdayToDelete}
        onOpenChange={(open) => !open && setBirthdayToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the birthday for ${birthdayToDelete?.name}.`}
        onConfirm={confirmDelete}
        isLoading={deleteBirthday.isPending}
      />
    </div>
  )
}
