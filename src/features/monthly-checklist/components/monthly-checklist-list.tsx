import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type MonthlyChecklist } from '@/db/schema'
import { Pencil, PlusIcon } from 'lucide-react'

import { useMonthlyChecklist } from '@/hooks/use-monthly-checklist'

import { AddMonthlyChecklistForm } from './add-monthly-checklist-form'

export function MonthlyChecklistList() {
  const { data: monthlyChecklist, isLoading: isLoadingMonthlyChecklist } = useMonthlyChecklist()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMonthlyChecklist, setEditingMonthlyChecklist] = useState<MonthlyChecklist | null>(null)

  if (isLoadingMonthlyChecklist) return <div className="p-4">Loading monthly checklist items...</div>

  const activeMonthlyChecklist = monthlyChecklist?.filter((item) => item.active) || []

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
    <div className="space-y-6">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingMonthlyChecklist(item)}
              aria-label={`Edit item ${item.name}`}
            >
              <Pencil />
            </Button>
          </li>
        ))}
      </ul>

      <AddMonthlyChecklistForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingMonthlyChecklist && (
        <AddMonthlyChecklistForm
          open={!!editingMonthlyChecklist}
          onOpenChange={(open) => {
            if (!open) setEditingMonthlyChecklist(null)
          }}
          monthlyChecklist={editingMonthlyChecklist}
        />
      )}
    </div>
  )
}
