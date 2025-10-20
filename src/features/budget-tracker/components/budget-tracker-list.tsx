import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type BudgetItem, type BudgetSubItem } from '@/db/schema'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { formatCzechNumber } from '@/lib/formatters'
import {
  useBudgetBalance,
  useBudgetItems,
  useDeleteBudgetItem,
  useDeleteBudgetSubItem,
  useUpdateBudgetItem,
  useUpdateBudgetSubItem,
} from '@/hooks/use-budget'

import { BalanceInput } from './balance-input'
import { BudgetItemForm } from './budget-item-form'
import { BudgetSubItemForm } from './budget-sub-item-form'
import { BudgetTrackerTable } from './budget-tracker-table'

export function BudgetTrackerList() {
  const { data: balance } = useBudgetBalance()
  const { data: items = [], isLoading } = useBudgetItems()
  const deleteBudgetItem = useDeleteBudgetItem()
  const deleteBudgetSubItem = useDeleteBudgetSubItem()
  const updateBudgetItem = useUpdateBudgetItem()
  const updateBudgetSubItem = useUpdateBudgetSubItem()

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null)

  const [isAddSubItemDialogOpen, setIsAddSubItemDialogOpen] = useState(false)
  const [parentItemId, setParentItemId] = useState<string>('')
  const [editingSubItem, setEditingSubItem] = useState<{
    subItem: BudgetSubItem
    itemId: string
  } | null>(null)
  const [subItemToDelete, setSubItemToDelete] = useState<{
    subItemId: string
    itemId: string
    name: string
  } | null>(null)

  if (isLoading) {
    return <div className="p-4">Loading budget tracker...</div>
  }

  const currentBalance = balance ? parseFloat(balance.amount) : 0

  // Calculate total amount and total paid based on stored values
  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0)
  const totalPaid = items.reduce((sum, item) => sum + parseFloat(item.amountPaid), 0)
  const remainingToPay = totalAmount - totalPaid

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item)
  }

  const handleDeleteItem = (item: BudgetItem) => {
    setItemToDelete(item)
  }

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      deleteBudgetItem.mutate(itemToDelete.id)
      setItemToDelete(null)
      toast.success(`Budget item "${itemToDelete.name}" was deleted.`)
    }
  }

  const handleAddSubItem = (itemId: string) => {
    setParentItemId(itemId)
    setIsAddSubItemDialogOpen(true)
  }

  const handleEditSubItem = (itemId: string, subItem: BudgetSubItem) => {
    setEditingSubItem({ subItem, itemId })
  }

  const handleDeleteSubItem = (itemId: string, subItem: BudgetSubItem) => {
    setSubItemToDelete({ subItemId: subItem.id, itemId, name: subItem.name })
  }

  const confirmDeleteSubItem = () => {
    if (subItemToDelete) {
      deleteBudgetSubItem.mutate({ id: subItemToDelete.subItemId, budgetItemId: subItemToDelete.itemId })
      toast.success(`Sub-item "${subItemToDelete.name}" was deleted.`)
      setSubItemToDelete(null)
    }
  }

  const handleTogglePaid = async (id: string, paid: boolean, isSubItem = false, budgetItemId?: string) => {
    try {
      if (isSubItem && budgetItemId) {
        await updateBudgetSubItem.mutateAsync({
          id,
          budgetItemId,
          paid,
        })
      } else {
        await updateBudgetItem.mutateAsync({
          id,
          paid,
        })
      }
      toast.success(`Marked as ${paid ? 'paid' : 'unpaid'}`)
    } catch (error) {
      toast.error('Failed to update payment status')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance Section */}
      <BalanceInput />

      {/* Summary Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-1 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">Total Budget</p>
            <p className="text-2xl font-bold">{totalAmount > 0 ? `${formatCzechNumber(totalAmount)} CZK` : '-'}</p>
          </div>
          <div className="grid gap-1 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">Total Paid</p>
            <p className="text-2xl font-bold">{totalPaid > 0 ? `${formatCzechNumber(totalPaid)} CZK` : '-'}</p>
          </div>
          <div className="grid gap-1 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">Remaining to Pay</p>
            <p className="text-2xl font-bold">
              {remainingToPay > 0 ? `${formatCzechNumber(remainingToPay)} CZK` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Add Item Button */}
      <Button onClick={() => setIsAddItemDialogOpen(true)}>
        <PlusIcon />
        Add Budget Item
      </Button>

      {/* Budget Items Table */}
      {items.length > 0 ? (
        <BudgetTrackerTable
          data={items}
          balance={currentBalance}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onAddSubItem={handleAddSubItem}
          onEditSubItem={handleEditSubItem}
          onDeleteSubItem={handleDeleteSubItem}
          onTogglePaid={handleTogglePaid}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border py-12">
          <p className="text-muted-foreground">No budget items yet.</p>
          <Button onClick={() => setIsAddItemDialogOpen(true)}>
            <PlusIcon />
            Add your first budget item
          </Button>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <BudgetItemForm open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen} />

      {editingItem && (
        <BudgetItemForm
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null)
          }}
          item={editingItem}
        />
      )}

      {/* Add/Edit Sub-Item Dialog */}
      <BudgetSubItemForm
        open={isAddSubItemDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddSubItemDialogOpen(false)
            setParentItemId('')
          }
        }}
        budgetItemId={parentItemId}
      />

      {editingSubItem && (
        <BudgetSubItemForm
          open={!!editingSubItem}
          onOpenChange={(open) => {
            if (!open) setEditingSubItem(null)
          }}
          budgetItemId={editingSubItem.itemId}
          subItem={editingSubItem.subItem}
        />
      )}

      {/* Delete Confirmations */}
      <ConfirmationDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the budget item "${itemToDelete?.name}" and all its sub-items.`}
        onConfirm={confirmDeleteItem}
        isLoading={deleteBudgetItem.isPending}
      />

      <ConfirmationDialog
        open={!!subItemToDelete}
        onOpenChange={(open) => !open && setSubItemToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the sub-item "${subItemToDelete?.name}".`}
        onConfirm={confirmDeleteSubItem}
        isLoading={deleteBudgetSubItem.isPending}
      />
    </div>
  )
}
