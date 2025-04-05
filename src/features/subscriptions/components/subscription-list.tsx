import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type Subscription } from '@/db/schema'
import { PlusIcon } from 'lucide-react'

import { useDeleteSubscription, useSubscriptions } from '@/hooks/use-subscriptions'

import { AddSubscriptionForm } from './add-subscription-form'
import { SubscriptionTable } from './subscription-table'

export function SubscriptionList() {
  const { data: subscriptions, isLoading } = useSubscriptions()
  const deleteSubscription = useDeleteSubscription()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)

  if (isLoading) return <div className="p-4">Loading subscriptions...</div>

  const monthlySubscriptions = subscriptions?.filter((sub) => sub.frequency === 'monthly' && sub.active) || []
  const yearlySubscriptions = subscriptions?.filter((sub) => sub.frequency === 'yearly' && sub.active) || []

  // Calculate monthly spend
  const monthlySpend = monthlySubscriptions.reduce((total, sub) => {
    return total + parseFloat(sub.price)
  }, 0)

  // Calculate yearly spend (converted to monthly equivalent)
  const yearlySpendMonthly = yearlySubscriptions.reduce((total, sub) => {
    return total + parseFloat(sub.price) / 12
  }, 0)

  // Total monthly spend
  const totalMonthlySpend = monthlySpend + yearlySpendMonthly

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
  }

  const handleDeleteSubscription = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription)
  }

  const confirmDelete = () => {
    if (subscriptionToDelete) {
      deleteSubscription.mutate(subscriptionToDelete.id)
      setSubscriptionToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Subscription
      </Button>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-1 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">Monthly Subscriptions</p>
            <p className="text-2xl font-bold">{monthlySubscriptions.length > 0 ? `${monthlySpend} CZK` : '-'}</p>
          </div>
          <div className="grid gap-1 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">Yearly Subscriptions (Monthly)</p>
            <p className="text-2xl font-bold">
              {yearlySubscriptions.length > 0 ? `${yearlySpendMonthly.toFixed(2)} CZK` : '-'}
            </p>
          </div>
          <div className="bg-card grid gap-1 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">Total Monthly Spend</p>
            <p className="text-2xl font-bold">{totalMonthlySpend > 0 ? `${totalMonthlySpend} CZK` : '-'}</p>
          </div>
        </div>
      </div>

      {monthlySubscriptions.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Monthly Subscriptions</h2>
          <SubscriptionTable
            data={monthlySubscriptions}
            onEdit={handleEditSubscription}
            onDelete={handleDeleteSubscription}
          />
        </div>
      )}

      {yearlySubscriptions.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Yearly Subscriptions</h2>
          <SubscriptionTable
            data={yearlySubscriptions}
            onEdit={handleEditSubscription}
            onDelete={handleDeleteSubscription}
          />
        </div>
      )}

      {!monthlySubscriptions.length && !yearlySubscriptions.length && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p>No subscriptions yet.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon />
            Add your first subscription
          </Button>
        </div>
      )}

      <AddSubscriptionForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingSubscription && (
        <AddSubscriptionForm
          open={!!editingSubscription}
          onOpenChange={(open) => {
            if (!open) setEditingSubscription(null)
          }}
          subscription={editingSubscription}
        />
      )}

      <ConfirmationDialog
        open={!!subscriptionToDelete}
        onOpenChange={(open) => !open && setSubscriptionToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete the subscription "${subscriptionToDelete?.name}".`}
        onConfirm={confirmDelete}
        isLoading={deleteSubscription.isPending}
      />
    </div>
  )
}
