import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

import { formatCzechNumber } from '@/lib/formatters'
import { useBudgetBalance, useUpdateBudgetBalance } from '@/hooks/use-budget'

export function BalanceInput() {
  const { data: balance } = useBudgetBalance()
  const updateBalance = useUpdateBudgetBalance()

  const [amount, setAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (balance) {
      setAmount(balance.amount)
    }
  }, [balance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount.trim()) {
      toast.error('Please enter a valid amount')
      return
    }

    if (isNaN(parseFloat(amount))) {
      toast.error('Amount must be a valid number')
      return
    }

    try {
      await updateBalance.mutateAsync({ amount })
      toast.success('Balance updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update balance')
      console.error(error)
    }
  }

  const handleCancel = () => {
    if (balance) {
      setAmount(balance.amount)
    }
    setIsEditing(false)
  }

  return (
    <div className="rounded-md border p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="balance">Current Balance</Label>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Input
                id="balance"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="300000"
                required
              />
            </div>
            <Button type="submit" disabled={updateBalance.isPending}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </form>
        ) : (
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="text-3xl font-bold">{balance ? `${formatCzechNumber(balance.amount)} CZK` : '-'}</div>
            <Button onClick={() => setIsEditing(true)}>{balance ? 'Update' : 'Set'} Balance</Button>
          </div>
        )}
      </div>
    </div>
  )
}
