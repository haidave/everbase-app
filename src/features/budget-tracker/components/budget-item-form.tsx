import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type BudgetItem } from '@/db/schema'
import { toast } from 'sonner'

import { useCreateBudgetItem, useUpdateBudgetItem } from '@/hooks/use-budget'

interface BudgetItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: BudgetItem | null
}

export function BudgetItemForm({ open, onOpenChange, item }: BudgetItemFormProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paid, setPaid] = useState(false)
  const [note, setNote] = useState('')
  const [hasSubItems, setHasSubItems] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    amount?: string
    amountPaid?: string
  }>({})

  const createItem = useCreateBudgetItem()
  const updateItem = useUpdateBudgetItem()

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (open && item) {
      setName(item.name)
      setAmount(item.amount)
      setAmountPaid(item.amountPaid)
      setPaid(item.paid)
      setNote(item.note || '')
      setHasSubItems(false)
    } else if (open) {
      setName('')
      setAmount('')
      setAmountPaid('0')
      setPaid(false)
      setNote('')
      setHasSubItems(false)
    }
    setErrors({})
  }, [open, item])

  // Auto-fill amount paid when marking as paid
  const handlePaidChange = (checked: boolean) => {
    setPaid(checked)
    if (checked && amount) {
      setAmountPaid(amount)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    const newErrors: typeof errors = {}

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Item name is required'
    }

    // Validate amount fields only if this item doesn't have sub-items
    if (!hasSubItems) {
      if (!amount.trim()) {
        newErrors.amount = 'Amount is required'
      } else if (isNaN(parseFloat(amount))) {
        newErrors.amount = 'Amount must be a valid number'
      }

      if (!amountPaid.trim()) {
        newErrors.amountPaid = 'Amount paid is required'
      } else if (isNaN(parseFloat(amountPaid))) {
        newErrors.amountPaid = 'Amount paid must be a valid number'
      }
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Use '0' if amounts are empty (will result in only sub-items total if any exist)
      const finalAmount = amount || '0'
      const finalAmountPaid = amountPaid || '0'

      if (item) {
        // Update existing item
        await updateItem.mutateAsync({
          id: item.id,
          name,
          amount: finalAmount,
          amountPaid: finalAmountPaid,
          paid,
          note: note || undefined,
        })
        toast.success('Budget item updated successfully')
      } else {
        // Create new item
        await createItem.mutateAsync({
          name,
          amount: finalAmount,
          amountPaid: finalAmountPaid,
          paid,
          note: note || undefined,
        })
        toast.success('Budget item created successfully')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save budget item')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              placeholder="e.g., Kitchen, Playstation 5"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (CZK) {!hasSubItems && '*'}</Label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) setErrors({ ...errors, amount: undefined })
                }}
                placeholder="300000"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
              {hasSubItems && (
                <p className="text-muted-foreground text-xs">Optional: This will be ADDED to the sum of sub-items</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid (CZK)</Label>
              <Input
                id="amountPaid"
                type="text"
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(e.target.value)
                  if (errors.amountPaid) setErrors({ ...errors, amountPaid: undefined })
                }}
                placeholder="0"
                className={errors.amountPaid ? 'border-destructive' : ''}
              />
              {errors.amountPaid && <p className="text-destructive text-sm">{errors.amountPaid}</p>}
              {hasSubItems && (
                <p className="text-muted-foreground text-xs">Optional: This will be ADDED to the sum of sub-items</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSubItems"
              checked={hasSubItems}
              onCheckedChange={(checked) => {
                setHasSubItems(checked as boolean)
                // Clear amount errors when toggling
                setErrors({})
              }}
            />
            <Label htmlFor="hasSubItems" className="cursor-pointer">
              This item will have sub-items
            </Label>
          </div>

          {hasSubItems && (
            <div className="text-muted-foreground rounded-md border p-3 text-sm">
              💡 <strong>Tip:</strong> Sub-items will be ADDED to the amounts above. Leave amounts empty if you only
              want the sub-items total.
            </div>
          )}

          {!hasSubItems && (
            <div className="flex items-center space-x-2">
              <Checkbox id="paid" checked={paid} onCheckedChange={(checked) => handlePaidChange(checked as boolean)} />
              <Label htmlFor="paid" className="cursor-pointer">
                Mark as fully paid
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a description or note..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
              {item ? 'Update' : 'Create'} Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
