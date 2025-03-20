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
import { type MonthlyChecklist } from '@/db/schema'
import { Pencil, PlusIcon, Trash2 } from 'lucide-react'

import { useDeleteMonthlyChecklist, useMonthlyChecklist } from '@/hooks/use-monthly-checklist'

import { AddMonthlyChecklistForm } from './add-monthly-checklist-form'

export function MonthlyChecklistList() {
  const { data: monthlyChecklist, isLoading: isLoadingMonthlyChecklist } = useMonthlyChecklist()
  const deleteMonthlyChecklist = useDeleteMonthlyChecklist()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMonthlyChecklist, setEditingMonthlyChecklist] = useState<MonthlyChecklist | null>(null)
  const [monthlyChecklistToDelete, setMonthlyChecklistToDelete] = useState<MonthlyChecklist | null>(null)

  if (isLoadingMonthlyChecklist) return <div className="p-4">Loading monthly checklist items...</div>

  const activeMonthlyChecklist = monthlyChecklist?.filter((item) => item.active) || []

  const handleEditMonthlyChecklist = (monthlyChecklist: MonthlyChecklist) => {
    setEditingMonthlyChecklist(monthlyChecklist)
  }

  const handleDeleteMonthlyChecklist = (monthlyChecklist: MonthlyChecklist) => {
    setMonthlyChecklistToDelete(monthlyChecklist)
  }

  const confirmDelete = () => {
    if (monthlyChecklistToDelete) {
      deleteMonthlyChecklist.mutate(monthlyChecklistToDelete.id)
      setMonthlyChecklistToDelete(null)
    }
  }

  if (!activeMonthlyChecklist.length) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>No monthly checklist items yet.</p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon />
          Create your first monthly checklist item
        </Button>
        <AddMonthlyChecklistForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon />
          Add Item
        </Button>
      </div>

      <ul className="space-y-2">
        {activeMonthlyChecklist.map((item) => (
          <li key={item.id} className="bg-card flex items-center justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="font-medium">{item.name}</p>
              {item.description && <p className="text-muted-foreground text-sm">{item.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditMonthlyChecklist(item)}
                aria-label={`Edit item ${item.name}`}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteMonthlyChecklist(item)}
                aria-label={`Delete item ${item.name}`}
                className="text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Monthly Checklist Form Dialog */}
      <AddMonthlyChecklistForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Monthly Checklist Dialog */}
      {editingMonthlyChecklist && (
        <AddMonthlyChecklistForm
          open={!!editingMonthlyChecklist}
          onOpenChange={(open) => {
            if (!open) setEditingMonthlyChecklist(null)
          }}
          monthlyChecklist={editingMonthlyChecklist}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!monthlyChecklistToDelete}
        onOpenChange={(open) => !open && setMonthlyChecklistToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item &ldquo;{monthlyChecklistToDelete?.name}&rdquo; and all its
              completion history.
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
