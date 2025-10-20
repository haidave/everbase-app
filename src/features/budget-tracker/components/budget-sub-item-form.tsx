import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type BudgetSubItem } from '@/db/schema'
import { toast } from 'sonner'

import { useCreateBudgetSubItem, useUpdateBudgetSubItem } from '@/hooks/use-budget'

interface BudgetSubItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetItemId: string
  subItem?: BudgetSubItem | null
}

export function BudgetSubItemForm({ open, onOpenChange, budgetItemId, subItem }: BudgetSubItemFormProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paid, setPaid] = useState(false)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{
    name?: string
    amount?: string
    amountPaid?: string
  }>({})

  const createSubItem = useCreateBudgetSubItem()
  const updateSubItem = useUpdateBudgetSubItem()

  // Reset form when dialog opens/closes or sub-item changes
  useEffect(() => {
    if (open && subItem) {
      setName(subItem.name)
      setAmount(subItem.amount)
      setAmountPaid(subItem.amountPaid)
      setPaid(subItem.paid)
      setNote(subItem.note || '')
    } else if (open) {
      setName('')
      setAmount('')
      setAmountPaid('0')
      setPaid(false)
      setNote('')
    }
    setErrors({})
  }, [open, subItem])

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
      newErrors.name = 'Sub-item name is required'
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(parseFloat(amount))) {
      newErrors.amount = 'Amount must be a valid number'
    }

    // Validate amount paid
    if (!amountPaid.trim()) {
      newErrors.amountPaid = 'Amount paid is required'
    } else if (isNaN(parseFloat(amountPaid))) {
      newErrors.amountPaid = 'Amount paid must be a valid number'
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      if (subItem) {
        // Update existing sub-item
        await updateSubItem.mutateAsync({
          id: subItem.id,
          budgetItemId,
          name,
          amount,
          amountPaid,
          paid,
          note: note || undefined,
        })
        toast.success('Sub-item updated successfully')
      } else {
        // Create new sub-item
        await createSubItem.mutateAsync({
          budgetItemId,
          name,
          amount,
          amountPaid,
          paid,
          note: note || undefined,
        })
        toast.success('Sub-item created successfully')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save sub-item')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subItem ? 'Edit Sub-Item' : 'Add Sub-Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sub-Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              placeholder="e.g., Fridge, Oven, Microwave"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (CZK) *</Label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) setErrors({ ...errors, amount: undefined })
                }}
                placeholder="50000"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
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
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="paid" checked={paid} onCheckedChange={(checked) => handlePaidChange(checked as boolean)} />
            <Label htmlFor="paid" className="cursor-pointer">
              Mark as fully paid
            </Label>
          </div>

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
            <Button type="submit" disabled={createSubItem.isPending || updateSubItem.isPending}>
              {subItem ? 'Update' : 'Create'} Sub-Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
